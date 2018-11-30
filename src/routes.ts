import Options from './options';
import {Requester, makeRequester} from './http_req';


const FLUSH_INTERVAL = 15000; // 15 seconds


interface Centroid {
    mean: number;
    n: number;
}

interface Centroids {
    each(fn: (c: Centroid) => void): void;
}

interface TDigest {
    centroids: Centroids;

    push(x: number);
    compress();
}

export interface TDigestConstructor {
    new(): TDigest;
}

interface TDigestCentroids {
    mean: number[];
    count: number[];
}

interface RouteKey {
    method: string;
    route: string;
    statusCode: number;
    time: Date;
}

interface RouteStat {
    count: number;
    sum: number;
    sumsq: number;
    tdigest?: TDigest;
    tdigestCentroids?: TDigestCentroids;
}

type time = Date | number | [number, number];

export interface RequestInfo {
    method: string;
    route: string;
    statusCode: number;
    start: time;
    end: time;
}

export class Routes {
    private opts: Options;
    private url: string;
    // TODO: use RouteKey as map key
    private m: {[key: string]: RouteStat} = {};
    private timer;

    private requester: Requester;

    constructor(opts: Options) {
        this.opts = opts;
        this.url = `${this.opts.host}/api/v5/projects/${this.opts.projectId}/routes-stats?key=${this.opts.projectKey}`;
        this.requester = makeRequester(this.opts);
    }

    notifyRequest(req: RequestInfo): void {
        let ms = durationMs(req.start, req.end);
        if (ms === 0) {
            ms = 0.1;
        }

        const minute = 60 * 1000;
        req.start = new Date(Math.floor(toTime(req.start) / minute) * minute);

        let key: RouteKey = {
            method: req.method,
            route: req.route,
            statusCode: req.statusCode,
            time: req.start
        };
        let keyStr = JSON.stringify(key);

        let stat: RouteStat;
        if (keyStr in this.m) {
            stat = this.m[keyStr];
        } else {
            stat = {
                count: 0,
                sum: 0,
                sumsq: 0
            };
            if (this.opts.TDigest) {
                stat.tdigest = new this.opts.TDigest();
            }

            this.m[keyStr] = stat;
        }

        stat.count++;
        stat.sum += ms;
        stat.sumsq += ms * ms;
        if (stat.tdigest) {
            stat.tdigest.push(ms);
        }

        if (this.timer) {
            return;
        }
        this.timer = setTimeout(() => { this.flush(); }, FLUSH_INTERVAL);
    }

    private flush(): void {
        let routes = [];
        for (let keyStr in this.m) {
            let key: RouteKey = JSON.parse(keyStr);
            let v = {
                ...key,
                ...this.m[keyStr]
            };
            if (v.tdigest) {
                v.tdigestCentroids = this.tdigestCentroids(v.tdigest);
                delete v.tdigest;
            }
            routes.push(v);
        }

        this.m = {};
        this.timer = null;

        let req = {
            method: 'POST',
            url: this.url,
            body: JSON.stringify({routes: routes}),
        };
        this.requester(req).then((_resp) => {
            // nothing
        }).catch((err) => {
            if (console.error) {
                console.error('can not report routes stats', err);
            }
        });
    }

    private tdigestCentroids(td: TDigest): TDigestCentroids {
        let means: number[] = [], counts: number[] = [];
        td.centroids.each((c: Centroid) => {
            means.push(c.mean);
            counts.push(c.n);
        });
        return {
            mean: means,
            count: counts,
        };
    }
}

const NS_PER_MS = 1e6;

function toTime(time: time): number {
    if (time instanceof Date) {
        return time.getTime();
    }
    if (typeof time === 'number') {
        return time;
    }
    if (time instanceof Array) {
        return time[0] + (time[1] / NS_PER_MS);
    }
    throw new Error(`unsupported type: ${typeof time}`);
}

function durationMs(start: time, end: time): number {
    if (start instanceof Date && end instanceof Date) {
        return end.getTime() - start.getTime();
    }
    if (typeof start === 'number' && typeof end === 'number') {
        return end - start;
    }
    if (start instanceof Array && end instanceof Array) {
        let ms = end[0] - start[0];
        ms += (end[1] - start[1]) / NS_PER_MS;
        return ms;
    }
    throw new Error(`unsupported type: ${typeof start}`);
}
