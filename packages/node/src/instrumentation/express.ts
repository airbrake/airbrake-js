import { Notifier } from '../notifier';

export function makeMiddleware(airbrake: Notifier) {
  return function airbrakeMiddleware(req, res, next): void {
    const route = req.route?.path?.toString() ?? 'UNKNOWN';
    const metric = airbrake.routes.start(req.method, route);
    if (!metric.isRecording()) {
      next();
      return;
    }

    const origEnd = res.end;
    res.end = function abEnd() {
      metric.route = req.route?.path?.toString() ?? 'UNKNOWN';
      metric.statusCode = res.statusCode;
      metric.contentType = res.get('Content-Type');
      airbrake.routes.notify(metric);
      return origEnd.apply(this, arguments);
    };

    next();
  };
}

export function makeErrorHandler(airbrake: Notifier) {
  return function airbrakeErrorHandler(err: Error, req, _res, next): void {
    const url = req.protocol + '://' + req.headers.host + req.originalUrl;
    const notice: any = {
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
      if (req.route.path) {
        notice.context.route = req.route.path.toString();
      }
      if (req.route.stack && req.route.stack.length) {
        notice.context.action = req.route.stack[0].name;
      }
    }

    const referer = req.headers.referer;
    if (referer) {
      notice.context.referer = referer;
    }

    airbrake.notify(notice);
    next(err);
  };
}
