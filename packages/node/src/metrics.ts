import * as asyncHooks from 'async_hooks';

export interface IMetric {
  startSpan(name: string, startTime?: Date): void;
  endSpan(name: string, endTime?: Date): void;
  _incGroup(name: string, ms: number): void;
}

export class Span {
  _metric: IMetric;

  name: string;
  startTime: Date;
  endTime: Date;

  _dur = 0;
  _level = 0;

  constructor(metric: IMetric, name: string, startTime?: Date) {
    this._metric = metric;

    this.name = name;
    this.startTime = startTime || new Date();
  }

  end(endTime?: Date) {
    if (endTime) {
      this.endTime = endTime;
    } else {
      this.endTime = new Date();
    }

    this._dur += this.endTime.getTime() - this.startTime.getTime();
    this._metric._incGroup(this.name, this._dur);
    this._metric = null;
  }

  _pause() {
    if (this._paused()) {
      return;
    }
    let now = new Date();
    this._dur += now.getTime() - this.startTime.getTime();
    this.startTime = null;
  }

  _resume() {
    if (!this._paused()) {
      return;
    }
    this.startTime = new Date();
  }

  _paused() {
    return this.startTime == null;
  }
}

export class BaseMetric implements IMetric {
  startTime: Date;
  endTime: Date;

  _spans = {};
  _groups = {};

  constructor() {
    this.startTime = new Date();
  }

  startSpan(name: string, startTime?: Date): void {
    let span = this._spans[name];
    if (span) {
      span._level++;
    } else {
      span = new Span(this, name, startTime);
      this._spans[name] = span;
    }
  }

  endSpan(name: string, endTime?: Date): void {
    let span = this._spans[name];
    if (!span) {
      console.error('airbrake: span=%s does not exist', name);
      return;
    }

    if (span._level > 0) {
      span._level--;
    } else {
      span.end(endTime);
      delete this._spans[span.name];
    }
  }

  _incGroup(name: string, ms: number): void {
    this._groups[name] = (this._groups[name] || 0) + ms;
  }

  _duration(): number {
    if (!this.endTime) {
      this.endTime = new Date();
    }
    return this.endTime.getTime() - this.startTime.getTime();
  }
}

class NoopMetric implements IMetric {
  startSpan(_name: string, _startTime?: Date): void {}
  endSpan(_name: string, _startTime?: Date): void {}
  _incGroup(_name: string, _ms: number): void {}
}

class Metrics {
  _asyncHook: asyncHooks.AsyncHook;

  _metrics: { [id: number]: IMetric } = {};
  _noopMetric = new NoopMetric();

  constructor() {
    this._asyncHook = asyncHooks
      .createHook({
        init: this._init.bind(this),
        destroy: this._destroy.bind(this),
        promiseResolve: this._destroy.bind(this),
      })
      .enable();
  }

  setActive(metric: IMetric) {
    const eid = asyncHooks.executionAsyncId();
    this._metrics[eid] = metric;
  }

  active(): IMetric {
    const eid = asyncHooks.executionAsyncId();
    let metric = this._metrics[eid];
    if (metric) {
      return metric;
    }
    return this._noopMetric;
  }

  _init(aid: number) {
    this._metrics[aid] = this._metrics[asyncHooks.executionAsyncId()];
  }

  _destroy(aid: number) {
    delete this._metrics[aid];
  }
}

let metrics = new Metrics();

export function setActiveMetric(metric: IMetric) {
  return metrics.setActive(metric);
}

export function activeMetric(): IMetric {
  return metrics.active();
}
