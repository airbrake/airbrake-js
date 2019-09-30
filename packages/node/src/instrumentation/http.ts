import { Notifier } from '../notifier';

const SPAN_NAME = 'http';

export function patch(http, airbrake: Notifier) {
  if (http.request) {
    http.request = wrapRequest(http.request, airbrake);
  }
  if (http.get) {
    http.get = wrapRequest(http.get, airbrake);
  }
}

export function wrapRequest(origFn, airbrake: Notifier) {
  return function abRequest() {
    const metric = airbrake.scope().metric();
    metric.startSpan(SPAN_NAME);

    const req = origFn.apply(this, arguments);
    if (!metric.isRecording()) {
      return req;
    }

    const origEmit = req.emit;
    req.emit = function(type, _res) {
      if (type === 'response') {
        metric.endSpan(SPAN_NAME);
      }
      return origEmit.apply(this, arguments);
    };

    return req;
  };
}
