import { Notifier } from '../notifier';

const SPAN_NAME = 'sql';

export function patch(mysql2, airbrake: Notifier) {
  const proto = mysql2.Connection.prototype;
  proto.query = wrapQuery(proto.query, airbrake);
  proto.execute = wrapQuery(proto.execute, airbrake);
  return mysql2;
}

function wrapQuery(origQuery, airbrake: Notifier) {
  return function abQuery(sql, values, cb) {
    const metric = airbrake.scope().routeMetric();
    metric.startSpan(SPAN_NAME);
    if (!metric.isRecording()) {
      return origQuery.apply(this, arguments);
    }

    let foundCallback = false;
    function wrapCallback(cb) {
      foundCallback = true;
      return function abCallback() {
        metric.endSpan(SPAN_NAME);
        return cb.apply(this, arguments);
      };
    }

    switch (typeof sql) {
      case 'function':
        arguments[0] = wrapCallback(sql);
        break;
      case 'object':
        if (typeof sql.onResult === 'function') {
          sql.onResult = wrapCallback(sql.onResult);
        }
        break;
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
          case 'error':
          case 'end':
          case 'close':
            metric.endSpan(SPAN_NAME);
            break;
        }
        return origEmit.apply(this, arguments);
      };
    }

    return res;
  };
}
