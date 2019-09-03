import { Notifier } from '../notifier';

const SPAN_NAME = 'sql';

export function patch(pg, airbrake: Notifier) {
  patchClient(pg.Client, airbrake);

  let getter = pg.__lookupGetter__('native');
  if (getter) {
    delete pg.native;
    pg.__defineGetter__('native', function() {
      let native = getter();
      if (native && native.Client) {
        patchClient(native.Client, airbrake);
      }
      return native;
    });
  }

  return pg;
}

function patchClient(Client, airbrake: Notifier): void {
  let origFn = Client.prototype.query;

  Client.prototype.query = function() {
    let metric = airbrake.activeMetric();
    metric.startSpan(SPAN_NAME);

    let args = arguments;
    let cbIdx = args.length - 1;
    let cb = args[cbIdx];
    if (Array.isArray(cb)) {
      let cbIdx = cb.length - 1;
      cb = cb[cbIdx];
    }

    if (typeof cb === 'function') {
      args[cbIdx] = function() {
        metric.endSpan(SPAN_NAME);
        return cb.apply(this, arguments);
      };
      return origFn.apply(this, arguments);
    }

    let query = origFn.apply(this, arguments);

    let endSpan = () => {
      metric.endSpan(SPAN_NAME);
    };

    if (typeof query.on === 'function') {
      query.on('end', endSpan);
      query.on('error', endSpan);
    } else if (typeof query.then === 'function') {
      query.then(endSpan);
    }

    return query;
  };
}
