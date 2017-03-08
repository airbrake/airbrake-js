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

import {getHistory} from './instrumentation/historian';


declare const VERSION: string;

interface FunctionWrapper {
    (): any;
    __airbrake: boolean;
    __inner: () => any;
}

class Client {
    private opts: ReporterOptions = {} as ReporterOptions;

    private processor: Processor;
    private reporters: Reporter[] = [];
    private filters: Filter[] = [];

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
        let notice: Notice = {
            id: '',
            errors: null,
            context: Object.assign({
                language: 'JavaScript',
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

    private ignoreNextWindowError() {
        this.ignoreWindowError++;
        setTimeout(() => this.ignoreWindowError--);
    }
}

export = Client;
