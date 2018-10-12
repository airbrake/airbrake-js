import Client from '../client';

function makeMiddleware(client: Client) {
    return function(req, res, next): void {
        let start = new Date();
        next();
        let ms = new Date().getTime() - start.getTime();
        client.incRequest(req.method, req.route.path, res.statusCode, start, ms);
    };
}

function makeErrorHandler(client: Client) {
    return function errorHandler(err: Error, req, _res, next): void {
        let url = req.protocol + '://' + req.headers['host'] + req.path;
        let notice: any = {
            error: err,
            context: {
                userAddr: req.ip,
                userAgent: req.headers['user-agent'],
                url: url,
                route: req.route.path,
                httpMethod: req.method,
                component: 'express',
                action: req.route.stack[0].name,
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

(makeErrorHandler as any).makeMiddleware = makeMiddleware;
(makeErrorHandler as any).makeErrorHandler = makeErrorHandler;

export = makeErrorHandler;
