import Client from '../client';

function makeMiddleware(client: Client) {
  return function airbrakeMiddleware(req, res, next): void {
    let start = Date.now();
    next();
    let end = Date.now();
    let route = req.route ? req.route.path : 'UNKNOWN';
    client.notifyRequest({
      method: req.method,
      route,
      statusCode: res.statusCode,
      start,
      end,
    });
  };
}

function makeErrorHandler(client: Client) {
  return function airbrakeErrorHandler(err: Error, req, _res, next): void {
    let url = req.protocol + '://' + req.headers.host + req.path;
    let notice: any = {
      error: err,
      context: {
        userAddr: req.ip,
        userAgent: req.headers['user-agent'],
        url,
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

    let referer = req.headers.referer;
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

export default makeErrorHandler;
