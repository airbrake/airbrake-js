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

import {makeEventHandler, debounceEventHandler} from './instrumentation/dom';


declare const VERSION: string;

interface FunctionWrapper {
    (): any;
    __airbrake__: boolean;
    __inner__: () => any;
}

// Creates window.onerror handler for notifier. See
// https://developer.mozilla.org/en/docs/Web/API/GlobalEventHandlers/onerror.
function makeOnErrorHandler(notifier: Client): ErrorEventHandler {
    return function(message: string, filename?: string, line?: number, column?: number, error?: Error): void {
        if (error) {
            notifier.notify(error);
            return;
        }

        notifier.notify({error: {
            message: message,
            fileName: filename,
            lineNumber: line,
            columnNumber: column,
        }});
    };
}

class Client {
    onerror: ErrorEventHandler;

    private historyMaxLen = 10;

    private opts: ReporterOptions = {} as ReporterOptions;

    private processor: Processor;
    private reporters: Reporter[] = [];
    private filters: Filter[] = [];

    private history = [];
    private lastState;

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

        this.onerror = makeOnErrorHandler(this);

        if (typeof window === 'object') {
            this.addFilter(windowFilter);
            if (!window.onerror && !opts.onerror) {
                window.onerror = this.onerror;
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
            notice.params.history = this.history;
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

    private wrapArguments(args: any[]) {
        for (let i in args) {
            let arg = args[i];
            if (typeof arg === 'function') {
                args[i] = this.wrap(arg);
            }
        }
        return args;
    }

    wrap(fn): FunctionWrapper {
        if (fn.__airbrake__) {
            return fn;
        }

        let client = this;
        let airbrakeWrapper = function () {
            let fnArgs = Array.prototype.slice.call(arguments);
            let wrappedArgs = client.wrapArguments(fnArgs);
            try {
                return fn.apply(this, wrappedArgs);
            } catch (exc) {
                client.notify({error: exc, params: {arguments: fnArgs}});
            }
        } as FunctionWrapper;

        for (let prop in fn) {
            if (fn.hasOwnProperty(prop)) {
                airbrakeWrapper[prop] = fn[prop];
            }
        }

        airbrakeWrapper.__airbrake__ = true;
        airbrakeWrapper.__inner__ = fn;

        return airbrakeWrapper;
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
            if (state[key] !== this.lastState[key]) {
                return false;
            }
        }
        return true;
    }

    private instrumentDOM(): void {
        let handler = makeEventHandler(this);
        document.addEventListener('click', handler, false);
        document.addEventListener(
            'keypress',
            debounceEventHandler(handler),
            false,
        );
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
                    type: m,
                    arguments: Array.prototype.slice.call(arguments),
                });
            };
            console[m] = newFn;
        }
    }

    private instrumentXHR(proto): void {
        let client = this;
        let state;

        let oldOpen = proto.open;
        proto.open = function(method, url) {
            state = {
                type: 'xhr',
                method: method,
                url: url,
            };
            return oldOpen.apply(this, arguments);
        };

        let oldSend = proto.send;
        proto.send = function(_data) {
            let req = this;
            let oldFn = req.onreadystatechange;
            req.onreadystatechange = function() {
                if (oldFn) {
                    oldFn = client.wrap(oldFn);
                    oldFn.apply(this, arguments);
                }
                if (!state || req.readyState !== 4) {
                    return;
                }
                state.statusCode = req.status;
                client.pushHistory(state);
                state = null;
            };

            const events = ['onload', 'onerror', 'onprogress'];
            for (let event of events) {
                if (typeof req[event] === 'function') {
                    req[event] = client.wrap(req[event]);
                }
            }

            return oldSend.apply(this, arguments);
        };
    }
}

export = Client;
