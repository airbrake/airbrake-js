function makeMiddleware(client) {
    return function airbrakeMiddleware(req, res, next) {
        var start = Date.now();
        next();
        var end = Date.now();
        var route = req.route ? req.route.path : 'UNKNOWN';
        client.notifyRequest({
            method: req.method,
            route: route,
            statusCode: res.statusCode,
            start: start,
            end: end,
        });
    };
}
function makeErrorHandler(client) {
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
        client.notify(notice);
        next(err);
    };
}
// Hack to preserve backwards compatibility.
makeErrorHandler.makeMiddleware = makeMiddleware;
makeErrorHandler.makeErrorHandler = makeErrorHandler;

export default makeErrorHandler;
//# sourceMappingURL=express.js.map
