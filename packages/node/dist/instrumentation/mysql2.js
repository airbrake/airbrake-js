'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SPAN_NAME = 'sql';
function patch(mysql2, airbrake) {
    var proto = mysql2.Connection.prototype;
    proto.query = wrapQuery(proto.query, airbrake);
    proto.execute = wrapQuery(proto.execute, airbrake);
}
function wrapQuery(origQuery, airbrake) {
    return function abQuery(sql, values, cb) {
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
        var foundCallback = false;
        function wrapCallback(callback) {
            foundCallback = true;
            return function abCallback() {
                endSpan();
                return callback.apply(this, arguments);
            };
        }
        var query;
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
                    case 'close':
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
//# sourceMappingURL=mysql2.js.map
