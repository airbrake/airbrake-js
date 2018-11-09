import Options from './options';
import {Requester, makeRequester} from './http_req';


const FLUSH_INTERVAL = 15000;


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
    status_code: number;
    time: Date;
}

interface RouteStat {
    count: number;
    sum: number;
    sumsq: number;
    tdigest?: TDigest;
    tdigest_centroids?: TDigestCentroids;
}

export interface RequestInfo {
    method: string;
    route: string;
    statusCode: number;
    start: Date;
    end: Date;
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
        let startTime = toTime(req.start);
        let endTime = toTime(req.end);
        let ms = endTime - startTime;

        const minute = 60 * 1000;
        req.start = new Date(Math.floor(startTime / minute) * minute);

        let key: RouteKey = {
            method: req.method,
            route: req.route,
            status_code: req.statusCode,
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
                v.tdigest_centroids = this.tdigestCentroids(v.tdigest);
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

function toTime(date: any): number {
    if (date.getTime) {
        return date.getTime();
    }
    return date;
}
