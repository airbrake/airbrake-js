import { makeRequester, Requester } from './http_req';
import { replaceTemplate } from './instrumentation/template';
import Options, { IOptionsApiProxyProp, IOptionsProjectProps } from './options';

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

export type ITDigestConstructor = new () => ITDigest;

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

type time = Date | number | [number, number];

export interface IRequestInfo {
  method: string;
  route: string;
  statusCode: number;
  start: time;
  end: time;
}

export const routesStatsPath: string = '{host}/api/v5/projects/{projectId}/routes-stats?key={projectKey}';

export class Routes {
  private opts: Options;
  private url: string;
  // TODO: use RouteKey as map key
  private m: { [key: string]: IRouteStat } = {};
  private timer;

  private requester: Requester;

  constructor(opts: Options) {
    this.opts = opts;
    const { host, projectId, projectKey } = opts as IOptionsProjectProps;
    const { apiProxy } = opts as IOptionsApiProxyProp;
    if (apiProxy) {
      this.url = apiProxy.routesStats;
    } else {
      this.url = replaceTemplate(routesStatsPath, {
        host,
        projectId,
        projectKey
      });
      this.requester = makeRequester(this.opts);
    }
  }

  public notifyRequest(req: IRequestInfo): void {
    let ms = durationMs(req.start, req.end);
    if (ms === 0) {
      ms = 0.1;
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

    let req = {
      method: 'POST',
      url: this.url,
      body: JSON.stringify({ routes }),
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

const NS_PER_MS = 1e6;

function toTime(tm: time): number {
  if (tm instanceof Date) {
    return tm.getTime();
  }
  if (typeof tm === 'number') {
    return tm;
  }
  if (tm instanceof Array) {
    return tm[0] + tm[1] / NS_PER_MS;
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
  if (start instanceof Array && end instanceof Array) {
    let ms = end[0] - start[0];
    ms += (end[1] - start[1]) / NS_PER_MS;
    return ms;
  }
  throw new Error(`unsupported type: ${typeof start}`);
}
