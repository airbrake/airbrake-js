'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function makeMiddleware(airbrake) {
    return function airbrakeMiddleware(req, res, next) {
        var route = req.route ? req.route.path : 'UNKNOWN';
        var metric = airbrake.routes.start(req.method, route);
        if (!metric.isRecording()) {
            next();
            return;
        }
        var origEnd = res.end;
        res.end = function abEnd() {
            metric.route = req.route ? req.route.path : 'UNKNOWN';
            metric.statusCode = res.statusCode;
            metric.contentType = res.get('Content-Type');
            airbrake.routes.notify(metric);
            return origEnd.apply(this, arguments);
        };
        next();
    };
}
function makeErrorHandler(airbrake) {
    return function airbrakeErrorHandler(err, req, _res, next) {
        var url = req.protocol + '://' + req.headers.host + req.path;
        var notice = {
            error: err,
            context: {
                userAddr: req.ip,
                userAgent: req.headers['user-agent'],
                url: url,
                httpMethod: req.method,
                component: 'express',
            },
        };
        if (req.route) {
            notice.context.route = req.route.path;
            if (req.route.stack && req.route.stack.length) {
                notice.context.action = req.route.stack[0].name;
            }
        }
        var referer = req.headers.referer;
        if (referer) {
            notice.context.referer = referer;
        }
        airbrake.notify(notice);
        next(err);
    };
}

exports.makeErrorHandler = makeErrorHandler;
exports.makeMiddleware = makeMiddleware;
//# sourceMappingURL=express.js.map
