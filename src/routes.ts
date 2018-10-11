import Options from './options';
import {Requester, makeRequester} from './http_req';


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
    min: number;
    max: number;
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
        this.url = `${this.opts.host}/api/v4/projects/${this.opts.projectId}/routes-stats?key=${this.opts.projectKey}`;
        this.requester = makeRequester(this.opts);
    }

    incRequest(method: string, route: string, statusCode: number, time: Date, ms: number): void {
        let minute = 60 * 1000;
        time = new Date(Math.floor(time.getTime() / minute) * minute);

        let key: RouteKey = {
            method: method,
            route: route,
            statusCode: statusCode,
            time: time,
        };
        let keyStr = JSON.stringify(key);

        let stat: RouteStat;
        if (keyStr in this.m) {
            stat = this.m[keyStr];
        } else {
            stat = {count: 0, sum: 0, sumsq: 0, min: 0, max: 0};
            this.m[keyStr] = stat;
        }

        stat.count++;
        stat.sum += ms;
        stat.sumsq += ms * ms;
        if (ms < stat.min || stat.min === 0) {
            stat.min = ms;
        }
        if (ms > stat.max) {
            stat.max = ms;
        }

        if (this.timer) {
            return;
        }
        this.timer = setTimeout(() => { this.flush(); }, 1000);
    }

    private flush() {
        let routes = [];
        for (let keyStr in this.m) {
            let key: RouteKey = JSON.parse(keyStr);
            routes.push({
                ...key,
                ...this.m[keyStr]
            });
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
            if (console.log) {
                console.log('can not report routes stats', err);
            }
        });
    }
}
