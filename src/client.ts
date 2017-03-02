import Promise from './promise';
import {Notice, AirbrakeError} from './notice';

import Processor from './processor/processor';
import stacktracejsProcessor from './processor/stacktracejs';

import Filter from './filter/filter';
import windowFilter from './filter/window';
import nodeFilter from './filter/node';
import scriptErrorFilter from './filter/script_error';
import uncaughtMessageFilter from './filter/uncaught_message';
import angularMessageFilter from './filter/angular_message';

import {Reporter, ReporterOptions, detectReporter} from './reporter/reporter';
import nodeReporter from './reporter/node';
import compatReporter from './reporter/compat';
import xhrReporter from './reporter/xhr';
import jsonpReporter from './reporter/jsonp';

import {makeEventHandler} from './instrumentation/dom';


declare const VERSION: string;

interface FunctionWrapper {
    (): any;
    __airbrake: boolean;
    __inner: () => any;
}

interface XMLHttpRequestWithState extends XMLHttpRequest {
    __state: any;
}

class Client {
    private historyMaxLen = 10;

    private opts: ReporterOptions = {} as ReporterOptions;

    private processor: Processor;
    private reporters: Reporter[] = [];
    private filters: Filter[] = [];

    private history = [];
    private lastState;
    private lastURL: string | null;

    private ignoreWindowError = 0;

    constructor(opts: any = {}) {
        this.opts.projectId = opts.projectId;
        this.opts.projectKey = opts.projectKey;
        this.opts.host = opts.host || 'https://api.airbrake.io';
        this.opts.timeout = opts.timeout || 10000;

        this.processor = opts.processor || stacktracejsProcessor;
        this.addReporter(opts.reporter || detectReporter(opts));

        this.addFilter(scriptErrorFilter);
        this.addFilter(uncaughtMessageFilter);
        this.addFilter(angularMessageFilter);

        if (typeof window === 'object') {
            this.addFilter(windowFilter);
            if (!window.onerror && !opts.onerror) {
                window.onerror = this.onerror.bind(this);
            }
        } else {
            this.addFilter(nodeFilter);
            if (!opts.uncaughtException) {
                // Use eval to hide process usage from Webpack and Browserify.
                eval('process').on('uncaughtException', (err) => {
                    this.notify(err);
                    throw err;
                });
            }
        }

        if (typeof document === 'object') {
            this.instrumentDOM();
        }
        if (typeof console === 'object') {
            this.instrumentConsole();
        }
        if (typeof XMLHttpRequest === 'function') {
            this.instrumentXHR(XMLHttpRequest.prototype);
        }
        if (typeof history === 'object') {
            this.instrumentHistory();
        }
    }

    setProject(id: number, key: string): void {
        this.opts.projectId = id;
        this.opts.projectKey = key;
    }

    setHost(host: string) {
        this.opts.host = host;
    }

    addReporter(name: string|Reporter): void {
        let reporter: Reporter;
        switch (name) {
        case 'node':
            reporter = nodeReporter;
            break;
        case 'compat':
            reporter = compatReporter;
            break;
        case 'xhr':
            reporter = xhrReporter;
            break;
        case 'jsonp':
            reporter = jsonpReporter;
            break;
        default:
            reporter = name as Reporter;
        }
        this.reporters.push(reporter);
    }

    addFilter(filter: Filter): void {
        this.filters.push(filter);
    }

    notify(err) {
        let context: any = Object.assign({
            language: 'JavaScript',
            notifier: {
                name: 'airbrake-js',
                version: VERSION,
                url: 'https://github.com/airbrake/airbrake-js',
            },
        }, err.context);
        let notice: Notice = {
            id: '',
            errors: null,
            context: context,
            params: err.params || {},
            environment: err.environment || {},
            session: err.session || {},
        };
        if (this.history.length > 0) {
            notice.context.history = this.history;
        }

        let promise = new Promise();

        this.processor(err.error || err, (_: string, error: AirbrakeError): void => {
            notice.errors = [error];

            for (let filter of this.filters) {
                notice = filter(notice);
                if (notice === null || (notice as any) === false) {
                    return;
                }
            }

            for (let reporter of this.reporters) {
                reporter(notice, this.opts, promise);
            }
        });

        return promise;
    }

    wrap(fn): FunctionWrapper {
        if (fn.__airbrake) {
            return fn;
        }

        let client = this;
        let airbrakeWrapper = function () {
            let fnArgs = Array.prototype.slice.call(arguments);
            let wrappedArgs = client.wrapArguments(fnArgs);
            try {
                return fn.apply(this, wrappedArgs);
            } catch (err) {
                client.notify({error: err, params: {arguments: fnArgs}});
                client.ignoreNextWindowError();
                throw err;
            }
        } as FunctionWrapper;

        for (let prop in fn) {
            if (fn.hasOwnProperty(prop)) {
                airbrakeWrapper[prop] = fn[prop];
            }
        }

        airbrakeWrapper.__airbrake = true;
        airbrakeWrapper.__inner = fn;

        return airbrakeWrapper;
    }

    private wrapArguments(args: any[]) {
        for (let i in args) {
            let arg = args[i];
            if (typeof arg === 'function') {
                args[i] = this.wrap(arg);
            }
        }
        return args;
    }

    call(fn) {
        let wrapper = this.wrap(fn);
        return wrapper.apply(this, Array.prototype.slice.call(arguments, 1));
    }

    pushHistory(state): void {
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
            this.notify(err);
            return;
        }

        // Ignore errors without file or line.
        if (!filename || !line) {
            return;
        }

        this.notify({error: {
            message: message,
            fileName: filename,
            lineNumber: line,
            columnNumber: column,
            __noStack: true,
        }});
    }

    private ignoreNextWindowError() {
        this.ignoreWindowError++;
        setTimeout(() => this.ignoreWindowError--);
    }

    private instrumentDOM(): void {
        let handler = makeEventHandler(this);
        document.addEventListener('click', handler, false);
        document.addEventListener('keypress', handler, false);
    }

    private instrumentConsole(): void {
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

    private instrumentXHR(proto): void {
        let client = this;

        let oldOpen = proto.open;
        proto.open = function(
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

        let oldSend = proto.send;
        proto.send = function(_data?: any): void {
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
        delete req.__state;

        state.statusCode = req.status;
        if (state.start) {
            state.duration = new Date().getTime() - state.date.getTime();
        }
        this.pushHistory(state);
    }

    private instrumentHistory(): void {
        this.lastURL = document.location.pathname;

        let client = this;
        let oldFn = window.onpopstate;
        window.onpopstate = function(event: PopStateEvent): any {
            client.pushHistory({
                type: 'location',
                from: client.lastURL,
                to: document.location.pathname,
                state: event.state,
            });
            client.lastURL = document.location.pathname;

            if (oldFn) {
                return oldFn.apply(this, arguments);
            }
        };

        let oldPushState = history.pushState;
        history.pushState = function(state: any, title: string, url?: string | null): void {
            if (url) {
                if (url.charAt(0) !== '/') {
                    url = '/' + url;
                }
                client.pushHistory({
                    type: 'location',
                    from: client.lastURL,
                    to: url,
                    state: state,
                    title: title,
                });
                client.lastURL = url;
            }
            oldPushState.apply(this, arguments);
        };
    }
}

export = Client;
