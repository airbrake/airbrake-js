import { Notifier } from '../notifier';

export function makeMiddleware(airbrake: Notifier) {
  return function airbrakeMiddleware(req, res, next): void {
    let route = req.route ? req.route.path : 'UNKNOWN';
    let metric = airbrake.routes.start(req.method, route);

    next();

    metric.statusCode = req.statusCode;
    metric.contentType = res.get('Content-Type');
    airbrake.routes.notify(metric);
  };
}

export function makeErrorHandler(airbrake: Notifier) {
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

    airbrake.notify(notice);
    next(err);
  };
}
