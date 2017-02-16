import Client = require('../client');


function makeErrorHandler(client: Client) {
    return function errorHandler(err: Error, req, _res, next): void {
        let notice: any = {
            error: err,
            context: {
                url: req.url,
                httpMethod: req.httpMethod,
            },
        };
        let ua = req.get('User-Agent');
        if (ua) {
            notice.context.userAgent = ua;
        }

        client.notify(notice).catch(function(err) {
            console.log('airbrake failed:', err.toString());
        });
        next(err);
    };
}

export = makeErrorHandler;
