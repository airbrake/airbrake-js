import Promise from './promise';
import {Notice, AirbrakeError} from './notice';
import FuncWrapper from './func_wrapper';

import Processor from './processor/processor';
import stacktracejsProcessor from './processor/stacktracejs';

import Filter from './filter/filter';
import ignoreFilter from './filter/ignore';
import makeDebounceFilter from './filter/debounce';
import uncaughtMessageFilter from './filter/uncaught_message';
import angularMessageFilter from './filter/angular_message';
import windowFilter from './filter/window';
import nodeFilter from './filter/node';

import {Reporter, ReporterOptions, detectReporter} from './reporter/reporter';
import fetchReporter from './reporter/fetch';
import nodeReporter from './reporter/node';
import xhrReporter from './reporter/xhr';
import jsonpReporter from './reporter/jsonp';

import {historian, getHistory} from './instrumentation/historian';


declare const VERSION: string;

class Client {
    private opts: ReporterOptions = {} as ReporterOptions;

    private processor: Processor;
    private reporters: Reporter[] = [];
    private filters: Filter[] = [];

    private offline = false;
    private errors: any[] = [];

    constructor(opts: any = {}) {
        this.opts = opts;
        this.opts.host = this.opts.host || 'https://api.airbrake.io';
        this.opts.timeout = this.opts.timeout || 10000;

        this.processor = opts.processor || stacktracejsProcessor;
        this.addReporter(opts.reporter || detectReporter(opts));

        this.addFilter(ignoreFilter);
        this.addFilter(makeDebounceFilter());
        this.addFilter(uncaughtMessageFilter);
        this.addFilter(angularMessageFilter);

        if (typeof window === 'object') {
            this.addFilter(windowFilter);

            if (window.addEventListener) {
                window.addEventListener('online', this.onOnline.bind(this));
                window.addEventListener('offline', () => this.offline = true);
            }
        } else {
            this.addFilter(nodeFilter);
        }

        historian.registerNotifier(this);
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
        case 'fetch':
            reporter = fetchReporter;
            break;
        case 'node':
            reporter = nodeReporter;
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

    notify(err: any): Promise {
        if (typeof err !== 'object' || err.error === undefined) {
            err = {error: err};
        }
        let promise = err.promise || new Promise();

        if (!err.error) {
            let reason = new Error(
                `airbrake-js: got err=${JSON.stringify(err.error)}, wanted an Error`);
            promise.reject(reason);
            return promise;
        }

        if (this.opts.ignoreWindowError && err.context && err.context.windowError) {
            let reason = new Error('airbrake-js: window error is ignored');
            promise.reject(reason);
            return promise;
        }

        if (this.offline) {
            err.promise = promise;
            this.errors.push(err);
            if (this.errors.length > 100) {
                this.errors.slice(-100);
            }
            return promise;
        }

        let notice: Notice = {
            id: '',
            errors: [],
            context: Object.assign({
                language: 'JavaScript',
                severity: 'error',
                notifier: {
                    name: 'airbrake-js',
                    version: VERSION,
                    url: 'https://github.com/airbrake/airbrake-js',
                },
            }, err.context),
            params: err.params || {},
            environment: err.environment || {},
            session: err.session || {},
        };

        let history = getHistory();
        if (history.length > 0) {
            notice.context.history = history;
        }

        this.processor(err.error, (_: string, error: AirbrakeError): void => {
            notice.errors.push(error);

            for (let filter of this.filters) {
                let r = filter(notice);
                if (r === null) {
                    promise.reject(new Error('airbrake-js: error is filtered'));
                    return;
                }
                notice = r;
            }

            for (let reporter of this.reporters) {
                reporter(notice, this.opts, promise);
            }
        });

        return promise;
    }

    wrap(fn): FuncWrapper {
        if (fn._airbrake) {
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
                historian.ignoreNextWindowError();
                throw err;
            }
        } as FuncWrapper;

        for (let prop in fn) {
            if (fn.hasOwnProperty(prop)) {
                airbrakeWrapper[prop] = fn[prop];
            }
        }

        airbrakeWrapper._airbrake = true;
        airbrakeWrapper.inner = fn;

        return airbrakeWrapper;
    }

    private wrapArguments(args: any[]): any[] {
        for (let i in args) {
            let arg = args[i];
            if (typeof arg === 'function') {
                args[i] = this.wrap(arg);
            }
        }
        return args;
    }

    call(fn, ..._args: any[]): any {
        let wrapper = this.wrap(fn);
        return wrapper.apply(this, Array.prototype.slice.call(arguments, 1));
    }

    onerror(): void {
        historian.onerror.apply(historian, arguments);
    }

    private onOnline(): void {
        this.offline = false;

        for (let err of this.errors) {
            this.notify(err);
        }
        this.errors = [];
    }
}

export = Client;
