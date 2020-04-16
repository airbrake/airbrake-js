import { QueryInfo } from '@airbrake/browser';
import { Notifier } from '../notifier';

const SPAN_NAME = 'sql';

export function patch(pg, airbrake: Notifier): void {
  patchClient(pg.Client, airbrake);

  const origGetter = pg.__lookupGetter__('native');
  if (origGetter) {
    delete pg.native;
    pg.__defineGetter__('native', () => {
      const native = origGetter();
      if (native && native.Client) {
        patchClient(native.Client, airbrake);
      }
      return native;
    });
  }
}

// tslint:disable-next-line: variable-name
function patchClient(Client, airbrake: Notifier): void {
  const origQuery = Client.prototype.query;
  Client.prototype.query = function abQuery(sql) {
    const metric = airbrake.scope().routeMetric();
    if (!metric.isRecording()) {
      return origQuery.apply(this, arguments);
    }
    metric.startSpan(SPAN_NAME);

    if (sql && typeof sql.text === 'string') {
      sql = sql.text;
    }

    let qinfo: QueryInfo;
    if (typeof sql === 'string') {
      qinfo = airbrake.queries.start(sql);
    }

    let cbIdx = arguments.length - 1;
    let cb = arguments[cbIdx];
    if (Array.isArray(cb)) {
      cbIdx = cb.length - 1;
      cb = cb[cbIdx];
    }

    const endSpan = () => {
      metric.endSpan(SPAN_NAME);
      if (qinfo) {
        airbrake.queries.notify(qinfo);
      }
    };

    if (typeof cb === 'function') {
      arguments[cbIdx] = function abCallback() {
        endSpan();
        return cb.apply(this, arguments);
      };
      return origQuery.apply(this, arguments);
    }

    const query = origQuery.apply(this, arguments);

    if (typeof query.on === 'function') {
      query.on('end', endSpan);
      query.on('error', endSpan);
    } else if (
      typeof query.then === 'function' &&
      typeof query.catch === 'function'
    ) {
      query.then(endSpan).catch(endSpan);
    }

    return query;
  };
}
