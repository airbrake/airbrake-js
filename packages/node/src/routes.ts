import { makeRequester, Requester } from './http_req';
import Options from './options';

const TDigest = require('tdigest').TDigest;

const FLUSH_INTERVAL = 15000; // 15 seconds

interface ICentroid {
  mean: number;
  n: number;
}

interface ICentroids {
  each(fn: (c: ICentroid) => void): void;
}

interface ITDigest {
  centroids: ICentroids;

  push(x: number);
  compress();
}

interface ITDigestCentroids {
  mean: number[];
  count: number[];
}

interface IRouteKey {
  method: string;
  route: string;
  statusCode: number;
  time: Date;
}

interface IRouteStat {
  count: number;
  sum: number;
  sumsq: number;
  tdigest?: ITDigest;
  tdigestCentroids?: ITDigestCentroids;
}

type time = Date | number;

export interface IRequestInfo {
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
  private m: { [key: string]: IRouteStat } = {};
  private timer;

  private requester: Requester;

  constructor(opts: Options) {
    this.opts = opts;
    this.url = `${opts.host}/api/v5/projects/${opts.projectId}/routes-stats?key=${opts.projectKey}`;
    this.requester = makeRequester(opts);
  }

  public notifyRequest(req: IRequestInfo): void {
    let ms = durationMs(req.start, req.end);
    if (ms === 0) {
      ms = 0.00001;
    }

    const minute = 60 * 1000;
    req.start = new Date(Math.floor(toTime(req.start) / minute) * minute);

    let key: IRouteKey = {
      method: req.method,
      route: req.route,
      statusCode: req.statusCode,
      time: req.start,
    };
    let keyStr = JSON.stringify(key);

    let stat: IRouteStat;
    if (keyStr in this.m) {
      stat = this.m[keyStr];
    } else {
      stat = {
        count: 0,
        sum: 0,
        sumsq: 0,
        tdigest: new TDigest(),
      };

      this.m[keyStr] = stat;
    }

    stat.count++;
    stat.sum += ms;
    stat.sumsq += ms * ms;
    stat.tdigest.push(ms);

    if (this.timer) {
      return;
    }
    this.timer = setTimeout(() => {
      this.flush();
    }, FLUSH_INTERVAL);
  }

  private flush(): void {
    let routes = [];
    for (let keyStr in this.m) {
      if (!this.m.hasOwnProperty(keyStr)) {
        continue;
      }
      let key: IRouteKey = JSON.parse(keyStr);
      let v = {
        ...key,
        ...this.m[keyStr],
      };
      if (v.tdigest) {
        v.tdigestCentroids = this.tdigestCentroids(v.tdigest);
        delete v.tdigest;
      }
      routes.push(v);
    }

    this.m = {};
    this.timer = null;

    let outJSON = JSON.stringify({
      environment: this.opts.environment,
      routes,
    });
    let req = {
      method: 'POST',
      url: this.url,
      body: outJSON,
    };
    this.requester(req)
      .then((_resp) => {
        // nothing
      })
      .catch((err) => {
        if (console.error) {
          console.error('can not report routes stats', err);
        }
      });
  }

  private tdigestCentroids(td: ITDigest): ITDigestCentroids {
    let means: number[] = [];
    let counts: number[] = [];
    td.centroids.each((c: ICentroid) => {
      means.push(c.mean);
      counts.push(c.n);
    });
    return {
      mean: means,
      count: counts,
    };
  }
}

function toTime(tm: time): number {
  if (tm instanceof Date) {
    return tm.getTime();
  }
  if (typeof tm === 'number') {
    return tm;
  }
  throw new Error(`unsupported type: ${typeof tm}`);
}

function durationMs(start: time, end: time): number {
  if (start instanceof Date && end instanceof Date) {
    return end.getTime() - start.getTime();
  }
  if (typeof start === 'number' && typeof end === 'number') {
    return end - start;
  }
  throw new Error(`unsupported type: ${typeof start}`);
}
