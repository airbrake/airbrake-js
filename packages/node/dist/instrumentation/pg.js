'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SPAN_NAME = 'sql';
function patch(pg, airbrake) {
    patchClient(pg.Client, airbrake);
    var origGetter = pg.__lookupGetter__('native');
    if (origGetter) {
        delete pg.native;
        pg.__defineGetter__('native', function () {
            var native = origGetter();
            if (native && native.Client) {
                patchClient(native.Client, airbrake);
            }
            return native;
        });
    }
}
// tslint:disable-next-line: variable-name
function patchClient(Client, airbrake) {
    var origQuery = Client.prototype.query;
    Client.prototype.query = function abQuery(sql) {
        var metric = airbrake.scope().routeMetric();
        if (!metric.isRecording()) {
            return origQuery.apply(this, arguments);
        }
        metric.startSpan(SPAN_NAME);
        if (sql && typeof sql.text === 'string') {
            sql = sql.text;
        }
        var qinfo;
        if (typeof sql === 'string') {
            qinfo = airbrake.queries.start(sql);
        }
        var cbIdx = arguments.length - 1;
        var cb = arguments[cbIdx];
        if (Array.isArray(cb)) {
            cbIdx = cb.length - 1;
            cb = cb[cbIdx];
        }
        var endSpan = function () {
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
        var query = origQuery.apply(this, arguments);
        if (typeof query.on === 'function') {
            query.on('end', endSpan);
            query.on('error', endSpan);
        }
        else if (typeof query.then === 'function' &&
            typeof query.catch === 'function') {
            query.then(endSpan).catch(endSpan);
        }
        return query;
    };
}

exports.patch = patch;
//# sourceMappingURL=pg.js.map
