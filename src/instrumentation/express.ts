import Client from '../client';

function makeMiddleware(client: Client) {
    return function airbrakeMiddleware(req, res, next): void {
        let start = new Date();
        next();
        let ms = new Date().getTime() - start.getTime();
        let route = req.route ? req.route.path : req.url;
        client.incRequest(req.method, route, res.statusCode, start, ms);
    };
}

function makeErrorHandler(client: Client) {
    return function airbrakeErrorHandler(err: Error, req, _res, next): void {
        let url = req.protocol + '://' + req.headers['host'] + req.path;
        let action = req.route ? req.route.stack[0].name : '';
        let notice: any = {
            error: err,
            context: {
                userAddr: req.ip,
                userAgent: req.headers['user-agent'],
                url: url,
                route: req.route.path,
                httpMethod: req.method,
                component: 'express',
                action: action,
            },
        };
        let referer = req.headers['referer'];
        if (referer) {
            notice.context.referer = referer;
        }

        client.notify(notice);
        next(err);
    };
}

// Hack to preserve backwards compatibility.
(makeErrorHandler as any).makeMiddleware = makeMiddleware;
(makeErrorHandler as any).makeErrorHandler = makeErrorHandler;

export = makeErrorHandler;
