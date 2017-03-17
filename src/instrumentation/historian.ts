import Notifier from '../notifier';
import {makeEventHandler} from './dom';


interface XMLHttpRequestWithState extends XMLHttpRequest {
    __state: any;
}

export default class Historian {
    private historyMaxLen = 20;

    private notifiers: Notifier[] = [];

    private errors: any[] = [];
    private ignoreWindowError = 0;

    private history: any[] = [];
    private lastState: any;
    private lastLocation: string | null;

    constructor() {
        if (typeof window === 'object') {
            if (!window.onerror) {
                window.onerror = this.onerror.bind(this);
            }
        }
        if (typeof document === 'object') {
            this.dom();
        }
        if (typeof console === 'object') {
            this.console();
        }
        if (typeof XMLHttpRequest !== 'undefined') {
            this.xhr();
        }
        if (typeof history === 'object') {
            this.location();
        }
    }

    registerNotifier(n: Notifier) {
        this.notifiers.push(n);

        for (let err of this.errors) {
            this.notifyNotifiers(err);
        }
        this.errors = [];
    }

    notify(err: any): void {
        if (this.notifiers.length > 0) {
            this.notifyNotifiers(err);
            return;
        }

        this.errors.push(err);
        if (this.errors.length > this.historyMaxLen) {
            this.errors = this.errors.slice(-this.historyMaxLen);
        }
    }

    private notifyNotifiers(err: any): void {
        for (let notifier of this.notifiers) {
            notifier.notify(err);
        }
    }

    onerror(
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
                message: message,
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

    ignoreNextWindowError(): void {
        this.ignoreWindowError++;
        setTimeout(() => this.ignoreWindowError--);
    }

    getHistory(): any[] {
        return this.history;
    }

    pushHistory(state: any): void {
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
            if (key === 'date') {
                continue;
            }
            if (state[key] !== this.lastState[key]) {
                return false;
            }
        }
        return true;
    }

    dom(): void {
        let handler = makeEventHandler(this);
        document.addEventListener('click', handler, false);
        document.addEventListener('keypress', handler, false);
        window.addEventListener('error', function(event: Event): void {
            if ('error' in event) {
                return;
            }
            handler(event);
        }, true);
    }

    console(): void {
        let client = this;
        let methods = ['debug', 'log', 'info', 'warn', 'error'];
        for (let m of methods) {
            if (!(m in console)) {
                continue;
            }

            let oldFn = console[m];
            let newFn = function () {
                oldFn.apply(console, arguments);
                client.pushHistory({
                    type: 'log',
                    severity: m,
                    arguments: Array.prototype.slice.call(arguments),
                });
            };
            console[m] = newFn;
        }
    }

    xhr(): void {
        let client = this;

        let oldOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(
            method: string,
            url: string,
            _async?: boolean,
            _user?: string,
            _password?: string
        ): void {
            this.__state = {
                type: 'xhr',
                method: method,
                url: url,
            };
            oldOpen.apply(this, arguments);
        };

        let oldSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(_data?: any): void {
            let oldFn = this.onreadystatechange;
            this.onreadystatechange = function(_ev: Event): any {
                if (this.__state && this.readyState === 4) {
                    client.recordReq(this);
                }
                if (oldFn) {
                    return oldFn.apply(this, arguments);
                }
            };

            (this as XMLHttpRequestWithState).__state.date = new Date();
            return oldSend.apply(this, arguments);
        };
    }

    private recordReq(req: XMLHttpRequestWithState): void {
        let state = req.__state;
        state.statusCode = req.status;
        if (state.date) {
            state.duration = new Date().getTime() - state.date.getTime();
        }
        this.pushHistory(state);
    }

    location(): void {
        this.lastLocation = document.location.pathname;

        let client = this;
        let oldFn = window.onpopstate;
        window.onpopstate = function(_event: PopStateEvent): any {
            client.recordLocation(document.location.pathname);
            if (oldFn) {
                return oldFn.apply(this, arguments);
            }
        };

        let oldPushState = history.pushState;
        history.pushState = function(_state: any, _title: string, url?: string | null): void {
            if (url) {
                client.recordLocation(url);
            }
            oldPushState.apply(this, arguments);
        };
    }

    private recordLocation(url: string): void {
        let index = url.indexOf('://');
        if (index >= 0) {
            url = url.slice(index + 3);
            index = url.indexOf('/');
            if (index >= 0) {
                url = url.slice(index);
            } else {
                url = '/';
            }
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

export let historian = new Historian();

export function getHistory(): any[] {
    return historian.getHistory();
}
