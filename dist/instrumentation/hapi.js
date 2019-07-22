function makeHandler(client) {
    var fn = function (server, _options, next) {
        server.on('request-error', function (req, err) {
            var url = req.connection.info.protocol + '://' + req.headers.host + req.path;
            var notice = {
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
            var referer = req.headers.referer;
            if (referer) {
                notice.context.referer = referer;
            }
            client.notify(notice);
        });
        next();
    };
    fn.attributes = {
        name: 'airbrake-js',
        version: '1.0.0',
    };
    return fn;
}

export default makeHandler;
//# sourceMappingURL=hapi.js.map
