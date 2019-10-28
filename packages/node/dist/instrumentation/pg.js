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
function patchClient(Client, airbrake) {
    var origQuery = Client.prototype.query;
    Client.prototype.query = function abQuery() {
        var metric = airbrake.scope().routeMetric();
        metric.startSpan(SPAN_NAME);
        if (!metric.isRecording()) {
            return origQuery.apply(this, arguments);
        }
        var cbIdx = arguments.length - 1;
        var cb = arguments[cbIdx];
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
        var query = origQuery.apply(this, arguments);
        var endSpan = function () {
            metric.endSpan(SPAN_NAME);
        };
        if (typeof query.on === 'function') {
            query.on('end', endSpan);
            query.on('error', endSpan);
        }
        else if (typeof query.then === 'function') {
            query.then(endSpan);
        }
        return query;
    };
}

exports.patch = patch;
//# sourceMappingURL=pg.js.map
