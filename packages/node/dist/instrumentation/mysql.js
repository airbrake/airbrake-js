'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SPAN_NAME = 'sql';
function patch(mysql, airbrake) {
    mysql.createPool = wrapCreatePool(mysql.createPool, airbrake);
    var origCreatePoolCluster = mysql.createPoolCluster;
    mysql.createPoolCluster = function abCreatePoolCluster() {
        var cluster = origCreatePoolCluster.apply(this, arguments);
        cluster.of = wrapCreatePool(cluster.of, airbrake);
        return cluster;
    };
    var origCreateConnection = mysql.createConnection;
    mysql.createConnection = function abCreateConnection() {
        var conn = origCreateConnection.apply(this, arguments);
        wrapConnection(conn, airbrake);
        return conn;
    };
}
function wrapCreatePool(origFn, airbrake) {
    return function abCreatePool() {
        var pool = origFn.apply(this, arguments);
        pool.getConnection = wrapGetConnection(pool.getConnection, airbrake);
        return pool;
    };
}
function wrapGetConnection(origFn, airbrake) {
    return function abGetConnection() {
        var cb = arguments[0];
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
function wrapConnection(conn, airbrake) {
    var origQuery = conn.query;
    conn.query = function abQuery(sql, values, cb) {
        var foundCallback = false;
        function wrapCallback(cb) {
            foundCallback = true;
            return function abCallback() {
                endSpan();
                return cb.apply(this, arguments);
            };
        }
        var metric = airbrake.scope().routeMetric();
        if (!metric.isRecording()) {
            return origQuery.apply(this, arguments);
        }
        metric.startSpan(SPAN_NAME);
        var qinfo;
        var endSpan = function () {
            metric.endSpan(SPAN_NAME);
            if (qinfo) {
                airbrake.queries.notify(qinfo);
            }
        };
        var query;
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
        }
        else if (typeof cb === 'function') {
            arguments[2] = wrapCallback(cb);
        }
        var res = origQuery.apply(this, arguments);
        if (!foundCallback && res && res.emit) {
            var origEmit_1 = res.emit;
            res.emit = function abEmit(evt) {
                switch (evt) {
                    case 'end':
                    case 'error':
                        endSpan();
                        break;
                }
                return origEmit_1.apply(this, arguments);
            };
        }
        return res;
    };
}

exports.patch = patch;
//# sourceMappingURL=mysql.js.map
