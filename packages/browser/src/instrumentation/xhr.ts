import { Notifier } from '../notifier';

interface IXMLHttpRequestWithState extends XMLHttpRequest {
  __state: any;
}

export function instrumentXHR(notifier: Notifier): void {
  function recordReq(req: IXMLHttpRequestWithState): void {
    const state = req.__state;
    state.statusCode = req.status;
    state.duration = new Date().getTime() - state.date.getTime();
    notifier.scope().pushHistory(state);
  }

  const oldOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function abOpen(
    method: string,
    url: string,
    _async?: boolean,
    _user?: string,
    _password?: string
  ): void {
    if (notifier._ignoreNextXHR === 0) {
      this.__state = {
        type: 'xhr',
        method,
        url,
      };
    }
    oldOpen.apply(this, arguments);
  };

  const oldSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function abSend(_data?: any): void {
    let oldFn = this.onreadystatechange;
    this.onreadystatechange = function (_ev: Event): any {
      if (this.readyState === 4 && this.__state) {
        recordReq(this);
      }
      if (oldFn) {
        return oldFn.apply(this, arguments);
      }
    };

    if (this.__state) {
      (this as IXMLHttpRequestWithState).__state.date = new Date();
    }
    return oldSend.apply(this, arguments);
  };
}
