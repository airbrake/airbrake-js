import { IOptions } from '@browser/options';
import { makeRequester, Requester } from '@browser/http_req';
import { BaseMetric, setActiveMetric } from './metrics';

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

interface IBreakdownKey {
  method: string;
  route: string;
  responseType: string;
  time: Date;
}

class TDigestStat {
  count = 0;
  sum = 0;
  sumsq = 0;
  _td = new TDigest();

  add(ms: number) {
    this.count += 1;
    this.sum += ms;
    this.sumsq += ms * ms;
    this._td.push(ms);
  }

  toJSON() {
    return {
      count: this.count,
      sum: this.sum,
      sumsq: this.sumsq,
      tdigestCentroids: tdigestCentroids(this._td),
    };
  }
}

class TDigestStatGroups extends TDigestStat {
  groups: { [key: string]: TDigestStat } = {};

  addGroups(totalMs: number, groups: { [key: string]: number }) {
    this.add(totalMs);
    for (let name in groups) {
      this.addGroup(name, groups[name]);
    }
  }

  addGroup(name: string, ms: number) {
    let stat = this.groups[name];
    if (!stat) {
      stat = new TDigestStat();
      this.groups[name] = stat;
    }
    stat.add(ms);
  }

  toJSON() {
    return {
      count: this.count,
      sum: this.sum,
      sumsq: this.sumsq,
      tdigestCentroids: tdigestCentroids(this._td),
      groups: this.groups,
    };
  }
}

class RouteMetric extends BaseMetric {
  method: string;
  route: string;
  statusCode: number;
  contentType: string;

  constructor(method = '', route = '', statusCode = 0, contentType = '') {
    super();
    this.method = method;
    this.route = route;
    this.statusCode = statusCode;
    this.contentType = contentType;
    this.startTime = new Date();
    this.startSpan('http.handler', this.startTime);
  }

  end(endTime: Date = null): void {
    if (!this.endTime) {
      this.endTime = endTime || new Date();
    }
    this.endSpan('http.handler', this.endTime);
  }
}

class RoutesStats {
  _opts: IOptions;
  _url: string;
  _requester: Requester;

  _m: { [key: string]: TDigestStat } = {};
  _timer;

  constructor(opts: IOptions) {
    this._opts = opts;
    this._url = `${opts.host}/api/v5/projects/${opts.projectId}/routes-stats?key=${opts.projectKey}`;
    this._requester = makeRequester(opts);
  }

  notify(req: RouteMetric): void {
    let ms = req._duration();
    if (ms === 0) {
      ms = 0.00001;
    }

    const minute = 60 * 1000;
    let startTime = new Date(
      Math.floor(req.startTime.getTime() / minute) * minute,
    );

    let key: IRouteKey = {
      method: req.method,
      route: req.route,
      statusCode: req.statusCode,
      time: startTime,
    };
    let keyStr = JSON.stringify(key);

    let stat = this._m[keyStr];
    if (!stat) {
      stat = new TDigestStat();
      this._m[keyStr] = stat;
    }

    stat.add(ms);

    if (this._timer) {
      return;
    }
    this._timer = setTimeout(() => {
      this._flush();
    }, FLUSH_INTERVAL);
  }

  _flush(): void {
    let routes = [];
    for (let keyStr in this._m) {
      if (!this._m.hasOwnProperty(keyStr)) {
        continue;
      }

      let key: IRouteKey = JSON.parse(keyStr);
      let v = {
        ...key,
        ...this._m[keyStr].toJSON(),
      };

      routes.push(v);
    }

    this._m = {};
    this._timer = null;

    let outJSON = JSON.stringify({
      environment: this._opts.environment,
      routes,
    });
    let req = {
      method: 'POST',
      url: this._url,
      body: outJSON,
    };
    this._requester(req)
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

class RoutesBreakdowns {
  _opts: IOptions;
  _url: string;
  _requester: Requester;

  _m: { [key: string]: TDigestStatGroups } = {};
  _timer;

  constructor(opts: IOptions) {
    this._opts = opts;
    this._url = `${opts.host}/api/v5/projects/${opts.projectId}/routes-breakdowns?key=${opts.projectKey}`;
    this._requester = makeRequester(opts);
  }

  notify(req: RouteMetric): void {
    if (
      req.statusCode < 200 ||
      (req.statusCode >= 300 && req.statusCode < 400) ||
      req.statusCode === 404 ||
      Object.keys(req._groups).length <= 1
    ) {
      return;
    }

    let ms = req._duration();
    if (ms === 0) {
      ms = 0.00001;
    }

    const minute = 60 * 1000;
    let startTime = new Date(
      Math.floor(req.startTime.getTime() / minute) * minute,
    );

    let key: IBreakdownKey = {
      method: req.method,
      route: req.route,
      responseType: this._responseType(req),
      time: startTime,
    };
    let keyStr = JSON.stringify(key);

    let stat = this._m[keyStr];
    if (!stat) {
      stat = new TDigestStatGroups();
      this._m[keyStr] = stat;
    }

    stat.addGroups(ms, req._groups);

    if (this._timer) {
      return;
    }
    this._timer = setTimeout(() => {
      this._flush();
    }, FLUSH_INTERVAL);
  }

  _flush(): void {
    let routes = [];
    for (let keyStr in this._m) {
      if (!this._m.hasOwnProperty(keyStr)) {
        continue;
      }

      let key: IBreakdownKey = JSON.parse(keyStr);
      let v = {
        ...key,
        ...this._m[keyStr].toJSON(),
      };

      routes.push(v);
    }

    this._m = {};
    this._timer = null;

    let outJSON = JSON.stringify({
      environment: this._opts.environment,
      routes,
    });
    let req = {
      method: 'POST',
      url: this._url,
      body: outJSON,
    };
    this._requester(req)
      .then((_resp) => {
        // nothing
      })
      .catch((err) => {
        if (console.error) {
          console.error('can not report routes breakdowns', err);
        }
      });
  }

  _responseType(req: RouteMetric): string {
    if (req.statusCode >= 500) {
      return '5xx';
    }
    if (req.statusCode >= 400) {
      return '4xx';
    }
    if (!req.contentType) {
      return '';
    }
    return req.contentType.split(';')[0].split('/')[-1];
  }
}

export class Routes {
  _routes: RoutesStats;
  _breakdowns: RoutesBreakdowns;

  constructor(opts: IOptions) {
    this._routes = new RoutesStats(opts);
    this._breakdowns = new RoutesBreakdowns(opts);
  }

  start(
    method = '',
    route = '',
    statusCode = 0,
    contentType = '',
  ): RouteMetric {
    let metric = new RouteMetric(method, route, statusCode, contentType);
    setActiveMetric(metric);
    return metric;
  }

  notify(req: RouteMetric): void {
    req.end();
    this._routes.notify(req);
    this._breakdowns.notify(req);
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
