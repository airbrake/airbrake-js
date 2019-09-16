import { Notifier } from '../notifier';

const SPAN_NAME = 'sql';

export function patch(pg, airbrake: Notifier) {
  patchClient(pg.Client, airbrake);

  const origGetter = pg.__lookupGetter__('native');
  if (origGetter) {
    delete pg.native;
    pg.__defineGetter__('native', function() {
      const native = origGetter();
      if (native && native.Client) {
        patchClient(native.Client, airbrake);
      }
      return native;
    });
  }

  return pg;
}

function patchClient(Client, airbrake: Notifier): void {
  const origQuery = Client.prototype.query;
  Client.prototype.query = function abQuery() {
    const metric = airbrake.activeMetric();
    metric.startSpan(SPAN_NAME);
    if (!metric.isRecording()) {
      return origQuery.apply(this, arguments);
    }

    let cbIdx = arguments.length - 1;
    let cb = arguments[cbIdx];
    if (Array.isArray(cb)) {
      cbIdx = cb.length - 1;
      cb = cb[cbIdx];
    }

    if (typeof cb === 'function') {
      arguments[cbIdx] = function abCallback() {
        metric.endSpan(SPAN_NAME);
        return cb.apply(this, arguments);
      };
      return origQuery.apply(this, arguments);
    }

    const query = origQuery.apply(this, arguments);

    const endSpan = () => {
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
