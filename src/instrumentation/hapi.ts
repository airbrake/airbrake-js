import Client = require('../client');


function makeHandler(client: Client) {
    let fn: any = function (server, _options, next): void {
        server.on('request-error', function(req, err: Error): void {
            let url = req.connection.info.protocol + '://' +
                req.info.host +
                req.url.path;
            let notice: any = {
                error: err,
                context: {
                    url: url,
                    httpMethod: req.method,
                },
            };
            let ua = req.headers['user-agent'];
            if (ua) {
                notice.context.userAgent = ua;
            }

            client.notify(notice).catch(function(err) {
                console.log('airbrake failed:', err.toString());
            });
        });
        next();
    };
    fn.attributes = {
        name: 'airbrake-js',
        version: '1.0.0',
    };
    return fn;
}

export = makeHandler;
