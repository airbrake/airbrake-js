import IFuncWrapper from './func_wrapper';
import { makeEventHandler } from './instrumentation/dom';
import Notice from './notice';
import Notifier from './notifier';

const CONSOLE_METHODS = ['debug', 'log', 'info', 'warn', 'error'];

interface IXMLHttpRequestWithState extends XMLHttpRequest {
  __state: any;
}

export interface IHistorianOptions {
  onerror?: boolean;
  fetch?: boolean;
  history?: boolean;
  console?: boolean;
  xhr?: boolean;
}

export class Historian {
  private static _instance: Historian;

  private historyMaxLen = 20;

  private notifiers: Notifier[] = [];

  private errors: any[] = [];
  private ignoreWindowError = 0;

  private history: any[] = [];
  private lastState: any;
  private lastLocation: string | null;
  private ignoreNextXHR = 0;

  private consoleError: (message?: any, ...optionalParams: any[]) => void;

  constructor(opts: IHistorianOptions = {}) {
    if (enabled(opts.console) && typeof console === 'object' && console.error) {
      this.consoleError = console.error;
    }

    if (typeof window === 'object') {
      if (enabled(opts.onerror)) {
        // tslint:disable-next-line:no-this-assignment
        let self = this;
        let oldHandler = window.onerror;
        window.onerror = function() {
          if (oldHandler) {
            oldHandler.apply(this, arguments);
          }
          self.onerror.apply(self, arguments);
        };
      }

      this.domEvents();
      if (enabled(opts.fetch) && typeof fetch === 'function') {
        this.fetch();
      }
      if (enabled(opts.history) && typeof history === 'object') {
        this.location();
      }
    }

    // Don't use process.on when windows is defined such as Electron apps.
    if (
      typeof window === 'undefined' &&
      typeof process === 'object' &&
      typeof process.on === 'function'
    ) {
      process.on('uncaughtException', (err) => {
        this.notify(err).then(() => {
          if (process.listeners('uncaughtException').length !== 1) {
            return;
          }
          if (this.consoleError) {
            this.consoleError('uncaught exception', err);
          }
          process.exit(1);
        });
      });
      process.on('unhandledRejection', (reason: Error, _p) => {
        let msg = reason.message || String(reason);
        if (msg.indexOf && msg.indexOf('airbrake: ') === 0) {
          return;
        }

        this.notify(reason).then(() => {
          if (process.listeners('unhandledRejection').length !== 1) {
            return;
          }
          if (this.consoleError) {
            this.consoleError('unhandled rejection', reason);
          }
          process.exit(1);
        });
      });
    }

    if (enabled(opts.console) && typeof console === 'object') {
      this.console();
    }
    if (enabled(opts.xhr) && typeof XMLHttpRequest !== 'undefined') {
      this.xhr();
    }
  }

  public static instance(opts: IHistorianOptions = {}): Historian {
    if (!Historian._instance) {
      Historian._instance = new Historian(opts);
    }
    return Historian._instance;
  }

  public registerNotifier(notifier: Notifier) {
    this.notifiers.push(notifier);

    for (let err of this.errors) {
      this.notifyNotifiers(err);
    }
    this.errors = [];
  }

  public unregisterNotifier(notifier: Notifier) {
    let i = this.notifiers.indexOf(notifier);
    if (i !== -1) {
      this.notifiers.splice(i, 1);
    }
  }

  public notify(err: any): Promise<Notice> {
    if (this.notifiers.length > 0) {
      return this.notifyNotifiers(err);
    }

    this.errors.push(err);
    if (this.errors.length > this.historyMaxLen) {
      this.errors = this.errors.slice(-this.historyMaxLen);
    }

    return Promise.resolve(null);
  }

  private notifyNotifiers(err: any): Promise<Notice> {
    let promises: Array<Promise<Notice>> = [];
    for (let notifier of this.notifiers) {
      promises.push(notifier.notify(err));
    }
    return Promise.all(promises).then((notices) => {
      return notices[0];
    });
  }

  public onerror(
    message: string,
    filename?: string,
    line?: number,
    column?: number,
    err?: Error
  ): void {
    if (this.ignoreWindowError > 0) {
      return;
    }

    if (err) {
      this.notify({
        error: err,
        context: {
          windowError: true,
        },
      });
      return;
    }

    // Ignore errors without file or line.
    if (!filename || !line) {
      return;
    }

    this.notify({
      error: {
        message,
        fileName: filename,
        lineNumber: line,
        columnNumber: column,
        noStack: true,
      },
      context: {
        windowError: true,
      },
    });
  }

  public ignoreNextWindowError(): void {
    this.ignoreWindowError++;
    setTimeout(() => this.ignoreWindowError--);
  }

  public getHistory(): any[] {
    return this.history;
  }

  public pushHistory(state: any): void {
    if (this.isDupState(state)) {
      if (this.lastState.num) {
        this.lastState.num++;
      } else {
        this.lastState.num = 2;
      }
      return;
    }

    if (!state.date) {
      state.date = new Date();
    }
    this.history.push(state);
    this.lastState = state;

    if (this.history.length > this.historyMaxLen) {
      this.history = this.history.slice(-this.historyMaxLen);
    }
  }

  private isDupState(state): boolean {
    if (!this.lastState) {
      return false;
    }
    for (let key in state) {
      if (!state.hasOwnProperty(key) || key === 'date') {
        continue;
      }
      if (state[key] !== this.lastState[key]) {
        return false;
      }
    }
    return true;
  }

  public domEvents(): void {
    let handler = makeEventHandler(this);

    if (window.addEventListener) {
      window.addEventListener('load', handler);
      window.addEventListener(
        'error',
        (event: Event): void => {
          if ('error' in event) {
            return;
          }
          handler(event);
        },
        true
      );
    }

    if (typeof document === 'object' && document.addEventListener) {
      document.addEventListener('DOMContentLoaded', handler);
      document.addEventListener('click', handler);
      document.addEventListener('keypress', handler);
    }
  }

  public console(): void {
    // tslint:disable-next-line:no-this-assignment
    let client = this;
    for (let m of CONSOLE_METHODS) {
      if (!(m in console)) {
        continue;
      }

      let oldFn = console[m];
      let newFn = ((...args) => {
        oldFn.apply(console, args);
        client.pushHistory({
          type: 'log',
          severity: m,
          arguments: args,
        });
      }) as IFuncWrapper;
      newFn.inner = oldFn;
      console[m] = newFn;
    }
  }

  public unwrapConsole(): void {
    for (let m of CONSOLE_METHODS) {
      if (m in console && console[m].inner) {
        console[m] = console[m].inner;
      }
    }
  }

  public fetch(): void {
    // tslint:disable-next-line:no-this-assignment
    let client = this;
    let oldFetch = window.fetch;
    window.fetch = function(
      input: RequestInfo,
      init?: RequestInit
    ): Promise<Response> {
      let state: any = {
        type: 'xhr',
        date: new Date(),
      };

      state.url = typeof input === 'string' ? input : input.url;
      if (typeof input !== 'string') {
        state.url = input.url;
        state.method = input.method ? input.method : 'GET';
      } else {
        state.url = input;
        state.method = init && init.method ? init.method : 'GET';
      }
      // Some platforms (e.g. react-native) implement fetch via XHR.
      client.ignoreNextXHR++;
      setTimeout(() => client.ignoreNextXHR--);

      return oldFetch
        .apply(this, arguments)
        .then((resp: Response) => {
          state.statusCode = resp.status;
          state.duration = new Date().getTime() - state.date.getTime();
          client.pushHistory(state);
          return resp;
        })
        .catch((err) => {
          state.error = err;
          state.duration = new Date().getTime() - state.date.getTime();
          client.pushHistory(state);
          throw err;
        });
    };
  }

  public xhr(): void {
    // tslint:disable-next-line:no-this-assignment
    let client = this;

    let oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(
      method: string,
      url: string,
      _async?: boolean,
      _user?: string,
      _password?: string
    ): void {
      if (client.ignoreNextXHR === 0) {
        this.__state = {
          type: 'xhr',
          method,
          url,
        };
      }
      oldOpen.apply(this, arguments);
    };

    let oldSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(_data?: any): void {
      let oldFn = this.onreadystatechange;
      this.onreadystatechange = function(_ev: Event): any {
        if (this.readyState === 4 && this.__state) {
          client.recordReq(this);
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

  private recordReq(req: IXMLHttpRequestWithState): void {
    let state = req.__state;
    state.statusCode = req.status;
    state.duration = new Date().getTime() - state.date.getTime();
    this.pushHistory(state);
  }

  public location(): void {
    this.lastLocation = document.location.pathname;

    // tslint:disable-next-line:no-this-assignment
    let client = this;
    let oldFn = window.onpopstate;
    window.onpopstate = function(_event: PopStateEvent): any {
      client.recordLocation(document.location.pathname);
      if (oldFn) {
        return oldFn.apply(this, arguments);
      }
    };

    let oldPushState = history.pushState;
    history.pushState = function(
      _state: any,
      _title: string,
      url?: string | null
    ): void {
      if (url) {
        client.recordLocation(url.toString());
      }
      oldPushState.apply(this, arguments);
    };
  }

  private recordLocation(url: string): void {
    let index = url.indexOf('://');
    if (index >= 0) {
      url = url.slice(index + 3);
      index = url.indexOf('/');
      url = index >= 0 ? url.slice(index) : '/';
    } else if (url.charAt(0) !== '/') {
      url = '/' + url;
    }

    this.pushHistory({
      type: 'location',
      from: this.lastLocation,
      to: url,
    });
    this.lastLocation = url;
  }
}

function enabled(v: undefined | boolean): boolean {
  return v === undefined || v === true;
}
