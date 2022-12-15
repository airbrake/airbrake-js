import Promise from 'promise-polyfill';

import { IFuncWrapper } from './func_wrapper';
import { jsonifyNotice } from './jsonify_notice';
import { INotice } from './notice';
import { Scope } from './scope';

import { espProcessor } from './processor/esp';
import { Processor } from './processor/processor';

import { angularMessageFilter } from './filter/angular_message';
import { makeDebounceFilter } from './filter/debounce';
import { Filter } from './filter/filter';
import { ignoreNoiseFilter } from './filter/ignore_noise';
import { uncaughtMessageFilter } from './filter/uncaught_message';

import { makeRequester, Requester } from './http_req';

import { IOptions } from './options';
import { QueriesStats } from './queries';
import { QueueMetric, QueuesStats } from './queues';
import { RouteMetric, RoutesBreakdowns, RoutesStats } from './routes';
import { NOTIFIER_NAME, NOTIFIER_VERSION, NOTIFIER_URL } from './version';
import { PerformanceFilter } from './filter/performance_filter';
import { RemoteSettings } from './remote_settings';

export class BaseNotifier {
  routes: Routes;
  queues: Queues;
  queries: QueriesStats;

  _opt: IOptions;
  _url: string;

  _processor: Processor;
  _requester: Requester;
  _filters: Filter[] = [];
  _performanceFilters: PerformanceFilter[] = [];
  _scope = new Scope();

  _onClose: (() => void)[] = [];

  constructor(opt: IOptions) {
    if (!opt.projectId || !opt.projectKey) {
      throw new Error('airbrake: projectId and projectKey are required');
    }

    this._opt = opt;
    this._opt.host = this._opt.host || 'https://api.airbrake.io';
    this._opt.remoteConfigHost =
      this._opt.remoteConfigHost || 'https://notifier-configs.airbrake.io';
    this._opt.apmHost = this._opt.apmHost || 'https://api.airbrake.io';
    this._opt.timeout = this._opt.timeout || 10000;
    this._opt.keysBlocklist = this._opt.keysBlocklist || [/password/, /secret/];
    this._url = `${this._opt.host}/api/v3/projects/${this._opt.projectId}/notices?key=${this._opt.projectKey}`;

    this._opt.errorNotifications = this._opt.errorNotifications !== false;
    this._opt.performanceStats = this._opt.performanceStats !== false;

    this._opt.queryStats = this._opt.queryStats !== false;
    this._opt.queueStats = this._opt.queueStats !== false;

    this._opt.remoteConfig = this._opt.remoteConfig !== false;

    this._processor = this._opt.processor || espProcessor;
    this._requester = makeRequester(this._opt);

    this.addFilter(ignoreNoiseFilter);
    this.addFilter(makeDebounceFilter());
    this.addFilter(uncaughtMessageFilter);
    this.addFilter(angularMessageFilter);

    this.addFilter((notice: INotice): INotice | null => {
      notice.context.notifier = {
        name: NOTIFIER_NAME,
        version: NOTIFIER_VERSION,
        url: NOTIFIER_URL,
      };
      if (this._opt.environment) {
        notice.context.environment = this._opt.environment;
      }
      return notice;
    });

    this.routes = new Routes(this);
    this.queues = new Queues(this);
    this.queries = new QueriesStats(this._opt);

    if (this._opt.remoteConfig) {
      const pollerId = new RemoteSettings(this._opt).poll();
      this._onClose.push(() => clearInterval(pollerId));
    }
  }

  close(): void {
    for (let fn of this._onClose) {
      fn();
    }
  }

  scope(): Scope {
    return this._scope;
  }

  setActiveScope(scope: Scope) {
    this._scope = scope;
  }

  addFilter(filter: Filter): void {
    this._filters.push(filter);
  }

  addPerformanceFilter(performanceFilter: PerformanceFilter) {
    this._performanceFilters.push(performanceFilter);
  }

  notify(err: any): Promise<INotice> {
    if (typeof err !== 'object' || err === null || !('error' in err)) {
      err = { error: err };
    }
    this.handleFalseyError(err);

    let notice = this.newNotice(err);

    if (!this._opt.errorNotifications) {
      notice.error = new Error(
        `airbrake: not sending this error, errorNotifications is disabled err=${JSON.stringify(
          err.error
        )}`
      );
      return Promise.resolve(notice);
    }

    let error = this._processor(err.error);
    notice.errors.push(error);

    for (let filter of this._filters) {
      let r = filter(notice);
      if (r === null) {
        notice.error = new Error('airbrake: error is filtered');
        return Promise.resolve(notice);
      }
      notice = r;
    }

    if (!notice.context) {
      notice.context = {};
    }
    notice.context.language = 'JavaScript';
    return this._sendNotice(notice);
  }

  private handleFalseyError(err: any) {
    if (Number.isNaN(err.error)) {
      err.error = new Error('NaN');
    } else if (err.error === undefined) {
      err.error = new Error('undefined');
    } else if (err.error === '') {
      err.error = new Error('<empty string>');
    } else if (err.error === null) {
      err.error = new Error('null');
    }
  }

  private newNotice(err: any): INotice {
    return {
      errors: [],
      context: {
        severity: 'error',
        ...this.scope().context(),
        ...err.context,
      },
      params: err.params || {},
      environment: err.environment || {},
      session: err.session || {},
    };
  }

  _sendNotice(notice: INotice): Promise<INotice> {
    let body = jsonifyNotice(notice, {
      keysBlocklist: this._opt.keysBlocklist,
    });
    if (this._opt.reporter) {
      if (typeof this._opt.reporter === 'function') {
        return this._opt.reporter(notice);
      } else {
        console.warn('airbrake: options.reporter must be a function');
      }
    }

    let req = {
      method: 'POST',
      url: this._url,
      body,
    };
    return this._requester(req)
      .then((resp) => {
        notice.id = resp.json.id;
        notice.url = resp.json.url;
        return notice;
      })
      .catch((err) => {
        notice.error = err;
        return notice;
      });
  }

  wrap(fn, props: string[] = []): IFuncWrapper {
    if (fn._airbrake) {
      return fn;
    }

    // tslint:disable-next-line:no-this-assignment
    let client = this;
    let airbrakeWrapper = function () {
      let fnArgs = Array.prototype.slice.call(arguments);
      let wrappedArgs = client._wrapArguments(fnArgs);
      try {
        return fn.apply(this, wrappedArgs);
      } catch (err) {
        client.notify({ error: err, params: { arguments: fnArgs } });
        client._ignoreNextWindowError();
        throw err;
      }
    } as IFuncWrapper;

    for (let prop in fn) {
      if (fn.hasOwnProperty(prop)) {
        airbrakeWrapper[prop] = fn[prop];
      }
    }
    for (let prop of props) {
      if (fn.hasOwnProperty(prop)) {
        airbrakeWrapper[prop] = fn[prop];
      }
    }

    airbrakeWrapper._airbrake = true;
    airbrakeWrapper.inner = fn;

    return airbrakeWrapper;
  }

  _wrapArguments(args: any[]): any[] {
    for (let i = 0; i < args.length; i++) {
      let arg = args[i];
      if (typeof arg === 'function') {
        args[i] = this.wrap(arg);
      }
    }
    return args;
  }

  _ignoreNextWindowError() {}

  call(fn, ..._args: any[]): any {
    let wrapper = this.wrap(fn);
    return wrapper.apply(this, Array.prototype.slice.call(arguments, 1));
  }
}

class Routes {
  _notifier: BaseNotifier;
  _routes: RoutesStats;
  _breakdowns: RoutesBreakdowns;
  _opt: IOptions;

  constructor(notifier: BaseNotifier) {
    this._notifier = notifier;
    this._routes = new RoutesStats(notifier._opt);
    this._breakdowns = new RoutesBreakdowns(notifier._opt);
    this._opt = notifier._opt;
  }

  start(
    method = '',
    route = '',
    statusCode = 0,
    contentType = ''
  ): RouteMetric {
    const metric = new RouteMetric(method, route, statusCode, contentType);

    if (!this._opt.performanceStats) {
      return metric;
    }

    const scope = this._notifier.scope().clone();
    scope.setContext({ httpMethod: method, route });
    scope.setRouteMetric(metric);
    this._notifier.setActiveScope(scope);

    return metric;
  }

  notify(req: RouteMetric): void {
    if (!this._opt.performanceStats) {
      return;
    }

    req.end();

    for (const performanceFilter of this._notifier._performanceFilters) {
      if (performanceFilter(req) === null) {
        return;
      }
    }
    this._routes.notify(req);
    this._breakdowns.notify(req);
  }
}

class Queues {
  _notifier: BaseNotifier;
  _queues: QueuesStats;
  _opt: IOptions;

  constructor(notifier: BaseNotifier) {
    this._notifier = notifier;
    this._queues = new QueuesStats(notifier._opt);
    this._opt = notifier._opt;
  }

  start(queue: string): QueueMetric {
    const metric = new QueueMetric(queue);

    if (!this._opt.performanceStats) {
      return metric;
    }

    const scope = this._notifier.scope().clone();
    scope.setContext({ queue });
    scope.setQueueMetric(metric);
    this._notifier.setActiveScope(scope);

    return metric;
  }

  notify(q: QueueMetric): void {
    if (!this._opt.performanceStats) {
      return;
    }

    q.end();
    this._queues.notify(q);
  }
}
