import { Notifier } from '../notifier';
import { IMetric } from '../metrics';

const SPAN_NAME = 'sql';

export function patch(mysql, airbrake: Notifier) {
  mysql.createPool = wrapCreatePool(mysql.createPool, airbrake);

  const origCreatePoolCluster = mysql.createPoolCluster;
  mysql.createPoolCluster = function abCreatePoolCluster() {
    const cluster = origCreatePoolCluster.apply(this, arguments);
    cluster.of = wrapCreatePool(cluster.of, airbrake);
    return cluster;
  };

  const origCreateConnection = mysql.createConnection;
  mysql.createConnection = function abCreateConnection() {
    const conn = origCreateConnection.apply(this, arguments);
    wrapConnection(conn, airbrake);
    return conn;
  };

  return mysql;
}

function wrapCreatePool(origFn, airbrake: Notifier) {
  return function abCreatePool() {
    const pool = origFn.apply(this, arguments);
    pool.getConnection = wrapGetConnection(pool.getConnection, airbrake);
    return pool;
  };
}

function wrapGetConnection(origFn, airbrake: Notifier) {
  return function abGetConnection() {
    const cb = arguments[0];
    if (typeof cb === 'function') {
      arguments[0] = function abCallback(_err, conn) {
        if (conn) {
          wrapConnection(conn, airbrake);
        }
        return cb.apply(this, arguments);
      };
    }
    return origFn.apply(this, arguments);
  };
}

function wrapConnection(conn, airbrake: Notifier): void {
  let metric: IMetric;

  let foundCallback = false;
  function wrapCallback(cb) {
    foundCallback = true;
    return function abCallback() {
      metric.endSpan(SPAN_NAME);
      return cb.apply(this, arguments);
    };
  }

  const origQuery = conn.query;
  conn.query = function abQuery(sql, values, cb) {
    metric = airbrake.scope().routeMetric();
    metric.startSpan(SPAN_NAME);
    if (!metric.isRecording()) {
      return origQuery.apply(this, arguments);
    }

    switch (typeof sql) {
      case 'function':
        arguments[0] = wrapCallback(sql);
        break;
      case 'object':
        if (typeof sql._callback === 'function') {
          sql._callback = wrapCallback(sql._callback);
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
            metric.endSpan(SPAN_NAME);
            break;
        }
        return origEmit.apply(this, arguments);
      };
    }

    return res;
  };
}
