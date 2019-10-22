import { IOptions } from '@browser/options';
import { BaseNotifier } from '@browser/base_notifier';
import { INotice } from '@browser/notice';
import { nodeFilter } from './filter/node';
import { Scope, ScopeManager } from './scope';

export class Notifier extends BaseNotifier {
  _inFlight: number;

  _scopeManager: ScopeManager;
  _mainScope: Scope;

  constructor(opt: IOptions) {
    if (!opt.environment && process.env.NODE_ENV) {
      opt.environment = process.env.NODE_ENV;
    }
    super(opt);

    this.addFilter(nodeFilter);

    this._inFlight = 0;
    this._scopeManager = new ScopeManager();
    this._mainScope = new Scope();

    process.on('beforeExit', async () => {
      await this.flush();
    });
    process.on('uncaughtException', (err) => {
      this.notify(err).then(() => {
        if (process.listeners('uncaughtException').length !== 1) {
          return;
        }
        if (console.error) {
          console.error('uncaught exception', err);
        }
        process.exit(1);
      });
    });
    process.on('unhandledRejection', (reason: Error, _p) => {
      let msg = reason.message || String(reason);
      if (msg.indexOf && msg.indexOf('airbrake: ') === 0) {
        return;
      }

      this.notify(reason).then(() => {
        if (process.listeners('unhandledRejection').length !== 1) {
          return;
        }
        if (console.error) {
          console.error('unhandled rejection', reason);
        }
        process.exit(1);
      });
    });
  }

  scope(): Scope {
    let scope = this._scopeManager.active();
    if (scope) {
      return scope;
    }
    return this._mainScope;
  }

  setActiveScope(scope: Scope) {
    this._scopeManager.setActive(scope);
  }

  notify(err: any): Promise<INotice> {
    this._inFlight++;
    return super.notify(err).finally(() => {
      this._inFlight--;
    });
  }

  async flush(timeout = 3000): Promise<boolean> {
    if (this._inFlight === 0 || timeout <= 0) {
      return Promise.resolve(true);
    }
    return new Promise((resolve, _reject) => {
      let interval = timeout / 100;
      if (interval <= 0) {
        interval = 10;
      }

      const timerID = setInterval(() => {
        if (this._inFlight === 0) {
          resolve(true);
          clearInterval(timerID);
          return;
        }

        if (timeout <= 0) {
          resolve(false);
          clearInterval(timerID);
          return;
        }

        timeout -= interval;
      }, interval);
    });
  }
}
