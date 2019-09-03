import { IOptions } from '@browser/options';
import { BaseNotifier } from '@browser/base_notifier';
import { nodeFilter } from './filter/node';
import { Routes } from './routes';
import { IMetric, activeMetric } from './metric';

export class Notifier extends BaseNotifier {
  public routes: Routes;

  constructor(opt: IOptions) {
    if (!opt.environment && process.env.NODE_ENV) {
      opt.environment = process.env.NODE_ENV;
    }
    super(opt);

    this.addFilter(nodeFilter);
    this.routes = new Routes(opt);

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

  activeMetric(): IMetric {
    return activeMetric();
  }
}
