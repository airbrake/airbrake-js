'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SPAN_NAME = 'sql';
function patch(mysql2, airbrake) {
    var proto = mysql2.Connection.prototype;
    proto.query = wrapQuery(proto.query, airbrake);
    proto.execute = wrapQuery(proto.execute, airbrake);
    return mysql2;
}
function wrapQuery(origQuery, airbrake) {
    return function abQuery(sql, values, cb) {
        var metric = airbrake.scope().metric();
        metric.startSpan(SPAN_NAME);
        if (!metric.isRecording()) {
            return origQuery.apply(this, arguments);
        }
        var foundCallback = false;
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
        }
        else if (typeof cb === 'function') {
            arguments[2] = wrapCallback(cb);
        }
        var res = origQuery.apply(this, arguments);
        if (!foundCallback && res && res.emit) {
            var origEmit_1 = res.emit;
            res.emit = function abEmit(evt) {
                switch (evt) {
                    case 'error':
                    case 'end':
                    case 'close':
                        metric.endSpan(SPAN_NAME);
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
