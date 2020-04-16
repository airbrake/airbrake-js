import { QueryInfo } from '@airbrake/browser';
import { Notifier } from '../notifier';

const SPAN_NAME = 'sql';

export function patch(mysql, airbrake: Notifier): void {
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
  const origQuery = conn.query;
  conn.query = function abQuery(sql, values, cb) {
    let foundCallback = false;
    function wrapCallback(callback) {
      foundCallback = true;
      return function abCallback() {
        endSpan();
        return callback.apply(this, arguments);
      };
    }

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

    let query: string;
    switch (typeof sql) {
      case 'string':
        query = sql;
        break;
      case 'function':
        arguments[0] = wrapCallback(sql);
        break;
      case 'object':
        if (typeof sql._callback === 'function') {
          sql._callback = wrapCallback(sql._callback);
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
            endSpan();
            break;
        }
        return origEmit.apply(this, arguments);
      };
    }

    return res;
  };
}
