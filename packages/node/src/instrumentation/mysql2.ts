import { Notifier } from '../notifier';
import { QueryInfo } from '../queries';

const SPAN_NAME = 'sql';

export function patch(mysql2, airbrake: Notifier): void {
  const proto = mysql2.Connection.prototype;
  proto.query = wrapQuery(proto.query, airbrake);
  proto.execute = wrapQuery(proto.execute, airbrake);
}

function wrapQuery(origQuery, airbrake: Notifier) {
  return function abQuery(sql, values, cb) {
    const metric = airbrake.scope().routeMetric();
    if (!metric.isRecording()) {
      return origQuery.apply(this, arguments);
    }
    metric.startSpan(SPAN_NAME);

    let qinfo: QueryInfo;
    const endSpan = () => {
      metric.endSpan(SPAN_NAME);
      if (qinfo) {
        airbrake.queries.notify(qinfo);
      }
    };

    let foundCallback = false;
    function wrapCallback(cb) {
      foundCallback = true;
      return function abCallback() {
        endSpan();
        return cb.apply(this, arguments);
      };
    }

    let query: string;
    switch (typeof sql) {
      case 'string':
        query = sql;
        break;
      case 'function':
        arguments[0] = wrapCallback(sql);
        break;
      case 'object':
        if (typeof sql.onResult === 'function') {
          sql.onResult = wrapCallback(sql.onResult);
        }
        query = sql.sql;
        break;
    }

    if (query) {
      qinfo = airbrake.queries.start(query);
    }

    if (typeof values === 'function') {
      arguments[1] = wrapCallback(values);
    } else if (typeof cb === 'function') {
      arguments[2] = wrapCallback(cb);
    }

    const res = origQuery.apply(this, arguments);

    if (!foundCallback && res && res.emit) {
      const origEmit = res.emit;
      res.emit = function abEmit(evt) {
        switch (evt) {
          case 'end':
          case 'error':
          case 'close':
            endSpan();
            break;
        }
        return origEmit.apply(this, arguments);
      };
    }

    return res;
  };
}
