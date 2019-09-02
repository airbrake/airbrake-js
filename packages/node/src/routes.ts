import { IOptions } from '@browser/options';
import { makeRequester, Requester } from '@browser/http_req';

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

class TDigestStat {
  protected count = 0;
  protected sum = 0;
  protected sumsq = 0;
  protected td = new TDigest();

  add(ms: number) {
    this.count += 1;
    this.sum += ms;
    this.sumsq += ms * ms;
    this.td.push(ms);
  }

  toJSON() {
    return {
      count: this.count,
      sum: this.sum,
      sumsq: this.sumsq,
      tdigestCentroids: tdigestCentroids(this.td),
    };
  }
}

type time = Date | number;

export interface IRequestInfo {
  method: string;
  route: string;
  statusCode: number;
  contentType?: string;
  start: time;
  end: time;
}

export class Routes {
  protected opts: IOptions;
  protected url: string;
  protected requester: Requester;

  // TODO: use RouteKey as map key
  protected m: { [key: string]: TDigestStat } = {};
  protected timer;

  constructor(opts: IOptions) {
    this.opts = opts;
    this.url = `${opts.host}/api/v5/projects/${opts.projectId}/routes-stats?key=${opts.projectKey}`;
    this.requester = makeRequester(opts);
  }

  public notify(req: IRequestInfo): void {
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

    let stat: TDigestStat;
    if (keyStr in this.m) {
      stat = this.m[keyStr];
    } else {
      stat = new TDigestStat();
      this.m[keyStr] = stat;
    }

    stat.add(ms);

    if (this.timer) {
      return;
    }
    this.timer = setTimeout(() => {
      this.flush();
    }, FLUSH_INTERVAL);
  }

  protected flush(): void {
    let routes = [];
    for (let keyStr in this.m) {
      if (!this.m.hasOwnProperty(keyStr)) {
        continue;
      }
      routes.push(this.m[keyStr].toJSON());
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
}

function tdigestCentroids(td: ITDigest): ITDigestCentroids {
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
