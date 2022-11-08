import * as request from 'request';

interface IFuncWrapper {
    (): any;
    inner: () => any;
    _airbrake?: boolean;
}

interface INoticeFrame {
    function: string;
    file: string;
    line: number;
    column: number;
}
interface INoticeError {
    type: string;
    message: string;
    backtrace: INoticeFrame[];
}
interface INotice {
    id?: string;
    url?: string;
    error?: Error;
    errors?: INoticeError[];
    context?: any;
    params?: any;
    session?: any;
    environment?: any;
}

interface IMetric {
    isRecording(): boolean;
    startSpan(name: string, startTime?: Date): void;
    endSpan(name: string, endTime?: Date): void;
    _incGroup(name: string, ms: number): void;
}
declare class BaseMetric implements IMetric {
    startTime: Date;
    endTime: Date;
    _spans: {};
    _groups: {};
    constructor();
    end(endTime?: Date): void;
    isRecording(): boolean;
    startSpan(name: string, startTime?: Date): void;
    endSpan(name: string, endTime?: Date): void;
    _incGroup(name: string, ms: number): void;
    _duration(): number;
}
declare class NoopMetric implements IMetric {
    isRecording(): boolean;
    startSpan(_name: string, _startTime?: Date): void;
    endSpan(_name: string, _startTime?: Date): void;
    _incGroup(_name: string, _ms: number): void;
}

interface IHistoryRecord {
    type: string;
    date?: Date;
    [key: string]: any;
}
interface IMap {
    [key: string]: any;
}
declare class Scope {
    _noopMetric: NoopMetric;
    _routeMetric: IMetric;
    _queueMetric: IMetric;
    _context: IMap;
    _historyMaxLen: number;
    _history: IHistoryRecord[];
    _lastRecord: IHistoryRecord;
    clone(): Scope;
    setContext(context: IMap): void;
    context(): IMap;
    pushHistory(state: IHistoryRecord): void;
    private _isDupState;
    routeMetric(): IMetric;
    setRouteMetric(metric: IMetric): void;
    queueMetric(): IMetric;
    setQueueMetric(metric: IMetric): void;
}

declare type Processor = (err: Error) => INoticeError;

declare type Filter = (notice: INotice) => INotice | null;

declare type Reporter = (notice: INotice) => Promise<INotice>;
interface IInstrumentationOptions {
    onerror?: boolean;
    fetch?: boolean;
    history?: boolean;
    console?: boolean;
    xhr?: boolean;
}
interface IOptions {
    projectId: number;
    projectKey: string;
    environment?: string;
    host?: string;
    apmHost?: string;
    remoteConfigHost?: string;
    remoteConfig?: boolean;
    timeout?: number;
    keysBlocklist?: any[];
    processor?: Processor;
    reporter?: Reporter;
    instrumentation?: IInstrumentationOptions;
    errorNotifications?: boolean;
    performanceStats?: boolean;
    queryStats?: boolean;
    queueStats?: boolean;
    request?: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;
}

interface IHttpRequest {
    method: string;
    url: string;
    body?: string;
    timeout?: number;
    headers?: any;
}
interface IHttpResponse {
    json: any;
}
declare type Requester = (req: IHttpRequest) => Promise<IHttpResponse>;

interface ITDigestCentroids {
    mean: number[];
    count: number[];
}
declare class TDigestStat {
    count: number;
    sum: number;
    sumsq: number;
    _td: any;
    add(ms: number): void;
    toJSON(): {
        count: number;
        sum: number;
        sumsq: number;
        tdigestCentroids: ITDigestCentroids;
    };
}
declare class TDigestStatGroups extends TDigestStat {
    groups: {
        [key: string]: TDigestStat;
    };
    addGroups(totalMs: number, groups: {
        [key: string]: number;
    }): void;
    addGroup(name: string, ms: number): void;
    toJSON(): {
        count: number;
        sum: number;
        sumsq: number;
        tdigestCentroids: ITDigestCentroids;
        groups: {
            [key: string]: TDigestStat;
        };
    };
}

declare class QueryInfo {
    method: string;
    route: string;
    query: string;
    func: string;
    file: string;
    line: number;
    startTime: Date;
    endTime: Date;
    constructor(query?: string);
    _duration(): number;
}
declare class QueriesStats {
    _opt: IOptions;
    _url: string;
    _requester: Requester;
    _m: {
        [key: string]: TDigestStat;
    };
    _timer: any;
    constructor(opt: IOptions);
    start(query?: string): QueryInfo;
    notify(q: QueryInfo): void;
    _flush(): void;
}

declare class QueueMetric extends BaseMetric {
    queue: string;
    constructor(queue: string);
}
declare class QueuesStats {
    _opt: IOptions;
    _url: string;
    _requester: Requester;
    _m: {
        [key: string]: TDigestStatGroups;
    };
    _timer: any;
    constructor(opt: IOptions);
    notify(q: QueueMetric): void;
    _flush(): void;
}

declare class RouteMetric extends BaseMetric {
    method: string;
    route: string;
    statusCode: number;
    contentType: string;
    constructor(method?: string, route?: string, statusCode?: number, contentType?: string);
}
declare class RoutesStats {
    _opt: IOptions;
    _url: string;
    _requester: Requester;
    _m: {
        [key: string]: TDigestStat;
    };
    _timer: any;
    constructor(opt: IOptions);
    notify(req: RouteMetric): void;
    _flush(): void;
}
declare class RoutesBreakdowns {
    _opt: IOptions;
    _url: string;
    _requester: Requester;
    _m: {
        [key: string]: TDigestStatGroups;
    };
    _timer: any;
    constructor(opt: IOptions);
    notify(req: RouteMetric): void;
    _flush(): void;
    _responseType(req: RouteMetric): string;
}

declare type PerformanceFilter = (metric: RouteMetric) => RouteMetric | null;

declare class BaseNotifier {
    routes: Routes;
    queues: Queues;
    queries: QueriesStats;
    _opt: IOptions;
    _url: string;
    _processor: Processor;
    _requester: Requester;
    _filters: Filter[];
    _performanceFilters: PerformanceFilter[];
    _scope: Scope;
    _onClose: (() => void)[];
    constructor(opt: IOptions);
    close(): void;
    scope(): Scope;
    setActiveScope(scope: Scope): void;
    addFilter(filter: Filter): void;
    addPerformanceFilter(performanceFilter: PerformanceFilter): void;
    notify(err: any): Promise<INotice>;
    _sendNotice(notice: INotice): Promise<INotice>;
    wrap(fn: any, props?: string[]): IFuncWrapper;
    _wrapArguments(args: any[]): any[];
    _ignoreNextWindowError(): void;
    call(fn: any, ..._args: any[]): any;
}
declare class Routes {
    _notifier: BaseNotifier;
    _routes: RoutesStats;
    _breakdowns: RoutesBreakdowns;
    _opt: IOptions;
    constructor(notifier: BaseNotifier);
    start(method?: string, route?: string, statusCode?: number, contentType?: string): RouteMetric;
    notify(req: RouteMetric): void;
}
declare class Queues {
    _notifier: BaseNotifier;
    _queues: QueuesStats;
    _opt: IOptions;
    constructor(notifier: BaseNotifier);
    start(queue: string): QueueMetric;
    notify(q: QueueMetric): void;
}

interface ITodo {
    err: any;
    resolve: (notice: INotice) => void;
    reject: (err: Error) => void;
}
declare class Notifier extends BaseNotifier {
    protected offline: boolean;
    protected todo: ITodo[];
    _ignoreWindowError: number;
    _ignoreNextXHR: number;
    constructor(opt: IOptions);
    _instrument(opt?: IInstrumentationOptions): void;
    notify(err: any): Promise<INotice>;
    protected onOnline(): void;
    protected onOffline(): void;
    protected onUnhandledrejection(e: any): void;
    onerror(message: string, filename?: string, line?: number, column?: number, err?: Error): void;
    _ignoreNextWindowError(): void;
}

export { BaseNotifier, INotice, IOptions, Notifier, QueryInfo, Scope };
