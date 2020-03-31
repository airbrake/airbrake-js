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

export class BaseNotifier {
  routes: Routes;
  queues: Queues;
  queries: QueriesStats;

  _opt: IOptions;
  _url: string;

  _processor: Processor;
  _requester: Requester;
  _filters: Filter[] = [];
  _scope = new Scope();

  _onClose: Array<() => void> = [];

  constructor(opt: IOptions) {
    if (!opt.projectId || !opt.projectKey) {
      throw new Error('airbrake: projectId and projectKey are required');
    }

    this._opt = opt;
    this._opt.host = this._opt.host || 'https://api.airbrake.io';
    this._opt.timeout = this._opt.timeout || 10000;
    this._opt.keysBlacklist = this._opt.keysBlacklist || [/password/, /secret/];
    this._url = `${this._opt.host}/api/v3/projects/${this._opt.projectId}/notices?key=${this._opt.projectKey}`;

    this._processor = this._opt.processor || espProcessor;
    this._requester = makeRequester(this._opt);

    this.addFilter(ignoreNoiseFilter);
    this.addFilter(makeDebounceFilter());
    this.addFilter(uncaughtMessageFilter);
    this.addFilter(angularMessageFilter);

    this.addFilter((notice: INotice): INotice | null => {
      notice.context.notifier = {
        name: 'airbrake-js/browser',
        version: 'VERSION',
        url: 'https://github.com/airbrake/airbrake-js',
      };
      if (this._opt.environment) {
        notice.context.environment = this._opt.environment;
      }
      return notice;
    });

    this.routes = new Routes(this);
    this.queues = new Queues(this);
    this.queries = new QueriesStats(this._opt);
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

  notify(err: any): Promise<INotice> {
    let notice: INotice = {
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

    if (typeof err !== 'object' || err.error === undefined) {
      err = { error: err };
    }

    if (!err.error) {
      notice.error = new Error(
        `airbrake: got err=${JSON.stringify(err.error)}, wanted an Error`
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

  _sendNotice(notice: INotice): Promise<INotice> {
    let body = jsonifyNotice(notice, {
      keysBlacklist: this._opt.keysBlacklist,
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
        this._ignoreNextWindowError();
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

  constructor(notifier: BaseNotifier) {
    this._notifier = notifier;
    this._routes = new RoutesStats(notifier._opt);
    this._breakdowns = new RoutesBreakdowns(notifier._opt);
  }

  start(
    method = '',
    route = '',
    statusCode = 0,
    contentType = ''
  ): RouteMetric {
    const metric = new RouteMetric(method, route, statusCode, contentType);

    const scope = this._notifier.scope().clone();
    scope.setContext({ httpMethod: method, route });
    scope.setRouteMetric(metric);
    this._notifier.setActiveScope(scope);

    return metric;
  }

  notify(req: RouteMetric): void {
    req.end();
    this._routes.notify(req);
    this._breakdowns.notify(req);
  }
}

class Queues {
  _notifier: BaseNotifier;
  _queues: QueuesStats;

  constructor(notifier: BaseNotifier) {
    this._notifier = notifier;
    this._queues = new QueuesStats(notifier._opt);
  }

  start(queue: string): QueueMetric {
    const metric = new QueueMetric(queue);

    const scope = this._notifier.scope().clone();
    scope.setContext({ queue });
    scope.setQueueMetric(metric);
    this._notifier.setActiveScope(scope);

    return metric;
  }

  notify(q: QueueMetric): void {
    q.end();
    this._queues.notify(q);
  }
}
