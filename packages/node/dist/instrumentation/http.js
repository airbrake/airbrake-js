'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SPAN_NAME = 'http';
function patch(http, airbrake) {
    if (http.request) {
        http.request = wrapRequest(http.request, airbrake);
    }
    if (http.get) {
        http.get = wrapRequest(http.get, airbrake);
    }
}
function wrapRequest(origFn, airbrake) {
    return function abRequest() {
        var metric = airbrake.scope().metric();
        metric.startSpan(SPAN_NAME);
        var req = origFn.apply(this, arguments);
        if (!metric.isRecording()) {
            return req;
        }
        var origEmit = req.emit;
        req.emit = function (type, _res) {
            if (type === 'response') {
                metric.endSpan(SPAN_NAME);
            }
            return origEmit.apply(this, arguments);
        };
        return req;
    };
}

exports.patch = patch;
exports.wrapRequest = wrapRequest;
//# sourceMappingURL=http.js.map
