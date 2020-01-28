import { makeRequester, Requester } from './http_req';
import { IOptions } from './options';
import { hasTdigest, TDigestStat } from './tdshared';

const FLUSH_INTERVAL = 15000; // 15 seconds

interface IQueryKey {
  method: string;
  route: string;
  query: string;
  func: string;
  file: string;
  line: number;
  time: Date;
}

export class QueryInfo {
  method = '';
  route = '';
  query = '';
  func = '';
  file = '';
  line = 0;
  startTime = new Date();
  endTime: Date;

  constructor(query = '') {
    this.query = query;
  }

  _duration(): number {
    if (!this.endTime) {
      this.endTime = new Date();
    }
    return this.endTime.getTime() - this.startTime.getTime();
  }
}

export class QueriesStats {
  _opt: IOptions;
  _url: string;
  _requester: Requester;

  _m: { [key: string]: TDigestStat } = {};
  _timer;

  constructor(opt: IOptions) {
    this._opt = opt;
    this._url = `${opt.host}/api/v5/projects/${opt.projectId}/queries-stats?key=${opt.projectKey}`;
    this._requester = makeRequester(opt);
  }

  start(query = ''): QueryInfo {
    return new QueryInfo(query);
  }

  notify(q: QueryInfo): void {
    if (!hasTdigest) {
      return;
    }

    let ms = q._duration();

    const minute = 60 * 1000;
    let startTime = new Date(
      Math.floor(q.startTime.getTime() / minute) * minute
    );

    let key: IQueryKey = {
      method: q.method,
      route: q.route,
      query: q.query,
      func: q.func,
      file: q.file,
      line: q.line,
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
    let queries = [];
    for (let keyStr in this._m) {
      if (!this._m.hasOwnProperty(keyStr)) {
        continue;
      }

      let key: IQueryKey = JSON.parse(keyStr);
      let v = {
        ...key,
        ...this._m[keyStr].toJSON(),
      };

      queries.push(v);
    }

    this._m = {};
    this._timer = null;

    let outJSON = JSON.stringify({
      environment: this._opt.environment,
      queries,
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
          console.error('can not report queries stats', err);
        }
      });
  }
}
