import Notifier from '../notifier';


function makeHandler(client: Notifier) {
    let fn: any = function (server, _options, next): void {
        server.on('request-error', function(req, err: Error): void {
            let url = req.connection.info.protocol + '://' +
                req.headers['host'] +
                req.path;
            let notice: any = {
                error: err,
                context: {
                    userAddr: req.info.remoteAddress,
                    userAgent: req.headers['user-agent'],
                    url: url,
                    route: req.route.path,
                    httpMethod: req.method,
                    component: 'hapi',
                    action: req.route.settings.handler.name,
                },
            };
            let referer = req.headers['referer'];
            if (referer) {
                notice.context.referer = referer;
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
