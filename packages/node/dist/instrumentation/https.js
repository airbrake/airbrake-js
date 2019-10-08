'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SPAN_NAME = 'http';
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

function patch(https, airbrake) {
    if (https.request) {
        https.request = wrapRequest(https.request, airbrake);
    }
    if (https.get) {
        https.get = wrapRequest(https.get, airbrake);
    }
}

exports.patch = patch;
//# sourceMappingURL=https.js.map
