import { makeRequester, Requester } from './http_req';
import { BaseMetric } from './metrics';
import { IOptions } from './options';
import { hasTdigest, TDigestStatGroups } from './tdshared';

const FLUSH_INTERVAL = 15000; // 15 seconds

interface IQueueKey {
  queue: string;
  time: Date;
}

export class QueueMetric extends BaseMetric {
  queue: string;

  constructor(queue: string) {
    super();
    this.queue = queue;
    this.startTime = new Date();
  }
}

export class QueuesStats {
  _opt: IOptions;
  _url: string;
  _requester: Requester;

  _m: { [key: string]: TDigestStatGroups } = {};
  _timer;

  constructor(opt: IOptions) {
    this._opt = opt;
    this._url = `${opt.host}/api/v5/projects/${opt.projectId}/queues-stats?key=${opt.projectKey}`;
    this._requester = makeRequester(opt);
  }

  notify(q: QueueMetric): void {
    if (!hasTdigest) {
      return;
    }

    let ms = q._duration();
    if (ms === 0) {
      ms = 0.00001;
    }

    const minute = 60 * 1000;
    let startTime = new Date(
      Math.floor(q.startTime.getTime() / minute) * minute
    );

    let key: IQueueKey = {
      queue: q.queue,
      time: startTime,
    };
    let keyStr = JSON.stringify(key);

    let stat = this._m[keyStr];
    if (!stat) {
      stat = new TDigestStatGroups();
      this._m[keyStr] = stat;
    }

    stat.addGroups(ms, q._groups);

    if (this._timer) {
      return;
    }
    this._timer = setTimeout(() => {
      this._flush();
    }, FLUSH_INTERVAL);
  }

  _flush(): void {
    let queues = [];
    for (let keyStr in this._m) {
      if (!this._m.hasOwnProperty(keyStr)) {
        continue;
      }

      let key: IQueueKey = JSON.parse(keyStr);
      let v = {
        ...key,
        ...this._m[keyStr].toJSON(),
      };

      queues.push(v);
    }

    this._m = {};
    this._timer = null;

    let outJSON = JSON.stringify({
      environment: this._opt.environment,
      queues,
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
          console.error('can not report queues breakdowns', err);
        }
      });
  }
}
