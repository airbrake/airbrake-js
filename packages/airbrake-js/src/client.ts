import { Historian } from './historian';
import Options from './options';
import { BaseClient } from './base_client';
import Notice from './notice';

import windowFilter from './filter/window';

interface ITodo {
  err: any;
  resolve: (notice: Notice) => void;
  reject: (err: Error) => void;
}

export class Client extends BaseClient {
  protected historian: Historian;

  protected offline = false;
  protected todo: ITodo[] = [];

  constructor(opt: Options) {
    super(opt);

    this.addFilter(windowFilter);

    if (window.addEventListener) {
      this.onOnline = this.onOnline.bind(this);
      window.addEventListener('online', this.onOnline);
      this.onOffline = this.onOffline.bind(this);
      window.addEventListener('offline', this.onOffline);

      this.onUnhandledrejection = this.onUnhandledrejection.bind(this);
      window.addEventListener('unhandledrejection', this.onUnhandledrejection);

      this.onClose.push(() => {
        window.removeEventListener('online', this.onOnline);
        window.removeEventListener('offline', this.onOffline);
        window.removeEventListener(
          'unhandledrejection',
          this.onUnhandledrejection,
        );
      });
    }

    let historianOpts = opt.instrumentation || {};
    if (typeof historianOpts.console === undefined) {
      historianOpts.console = !isDevEnv(opt.environment);
    }

    this.historian = Historian.instance(historianOpts);
    this.historian.registerNotifier(this);
    this.addFilter((notice) => {
      let history = this.historian.getHistory();
      if (history.length > 0) {
        notice.context.history = history;
      }
      return notice;
    });
    this.onClose.push(() => {
      this.historian.unregisterNotifier(this);
    });
  }

  public notify(err: any): Promise<Notice> {
    if (this.offline) {
      return new Promise((resolve, reject) => {
        this.todo.push({
          err,
          resolve,
          reject,
        });
        while (this.todo.length > 100) {
          let j = this.todo.shift();
          if (j === undefined) {
            break;
          }
          j.resolve({
            error: new Error('airbrake: offline queue is too large'),
          });
        }
      });
    }

    return super.notify(err);
  }

  public onerror(): void {
    this.historian.onerror.apply(this.historian, arguments);
  }

  protected onOnline(): void {
    this.offline = false;

    for (let j of this.todo) {
      this.notify(j.err).then((notice) => {
        j.resolve(notice);
      });
    }
    this.todo = [];
  }

  protected onOffline(): void {
    this.offline = true;
  }

  protected onUnhandledrejection(e: PromiseRejectionEvent | CustomEvent): void {
    // Handle native or bluebird Promise rejections
    // https://developer.mozilla.org/en-US/docs/Web/Events/unhandledrejection
    // http://bluebirdjs.com/docs/api/error-management-configuration.html
    let reason =
      (e as PromiseRejectionEvent).reason ||
      ((e as CustomEvent).detail && (e as CustomEvent).detail.reason);
    if (!reason) {
      return;
    }
    let msg = reason.message || String(reason);
    if (msg.indexOf && msg.indexOf('airbrake: ') === 0) {
      return;
    }
    this.notify(reason);
  }
}

function isDevEnv(env: any): boolean {
  return env && env.startsWith && env.startsWith('dev');
}

export default Client;
