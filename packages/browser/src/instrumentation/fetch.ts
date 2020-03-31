import { Notifier } from '../notifier';

export function instrumentFetch(notifier: Notifier): void {
  // tslint:disable-next-line:no-this-assignment
  let oldFetch = window.fetch;
  window.fetch = function (
    req: RequestInfo,
    options?: RequestInit
  ): Promise<Response> {
    let state: any = {
      type: 'xhr',
      date: new Date(),
    };

    state.method = options && options.method ? options.method : 'GET';
    if (typeof req === 'string') {
      state.url = req;
    } else {
      state.method = req.method;
      state.url = req.url;
    }

    // Some platforms (e.g. react-native) implement fetch via XHR.
    notifier._ignoreNextXHR++;
    setTimeout(() => notifier._ignoreNextXHR--);

    return oldFetch
      .apply(this, arguments)
      .then((resp: Response) => {
        state.statusCode = resp.status;
        state.duration = new Date().getTime() - state.date.getTime();
        notifier.scope().pushHistory(state);
        return resp;
      })
      .catch((err) => {
        state.error = err;
        state.duration = new Date().getTime() - state.date.getTime();
        notifier.scope().pushHistory(state);
        throw err;
      });
  };
}
