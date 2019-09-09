import * as asyncHooks from 'async_hooks';

export interface IMetric {
  startSpan(name: string, startTime?: Date): void;
  endSpan(name: string, endTime?: Date): void;
  _incGroup(name: string, ms: number): void;
}

export class Span {
  name = '';
  startTime: Date;
  endTime: Date;

  _metric: IMetric;
  _parent: Span;

  _dur = 0;
  _level = 0;

  constructor(metric: IMetric, name: string, startTime: Date = null) {
    this._metric = metric;
    this._parent = null;

    this.name = name;
    this.startTime = startTime || new Date();
  }

  end(endTime: Date = null) {
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
  _currSpan: Span;

  _groups = {};

  constructor() {
    this.startTime = new Date();
  }

  startSpan(name: string, startTime: Date = null): void {
    if (this._currSpan) {
      if (this._currSpan.name === name) {
        this._currSpan._level++;
        return;
      }
      this._currSpan._pause();
    }

    let span = this._spans[name];
    if (span) {
      span._resume();
    } else {
      span = new Span(this, name, startTime);
      this._spans[name] = span;
    }

    span._parent = this._currSpan;
    this._currSpan = span;
  }

  endSpan(name: string, endTime: Date = null): void {
    if (this._currSpan && this._currSpan.name === name) {
      if (this._endSpan(this._currSpan)) {
        this._currSpan = this._currSpan._parent;
        if (this._currSpan) {
          this._currSpan._resume();
        }
      }
      return;
    }

    let span = this._spans[name];
    if (!span) {
      console.error('airbrake: span=%s does not exist', name);
      return;
    }
    this._endSpan(span, endTime);
  }

  _endSpan(span, endTime: Date = null): boolean {
    if (span._level > 0) {
      span._level--;
      return false;
    }
    span.end(endTime);
    delete this._spans[span.name];
    return true;
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
  startSpan(_name: string, _startTime: Date = null): void {}
  endSpan(_name: string, _startTime: Date = null): void {}
  _incGroup(_name: string, _ms: number): void {}
}

class Metrics {
  _asyncHook: asyncHooks.AsyncHook;

  _metrics: { [uid: number]: IMetric } = {};
  _noopMetric = new NoopMetric();

  constructor() {
    this._asyncHook = asyncHooks.createHook({
      init: this._init.bind(this),
      destroy: this._destroy.bind(this),
      promiseResolve: this._destroy.bind(this),
    });
  }

  setActive(metric: IMetric) {
    const uid = asyncHooks.executionAsyncId();
    this._metrics[uid] = metric;
  }

  active(): IMetric {
    const uid = asyncHooks.executionAsyncId();
    let metric = this._metrics[uid];
    if (metric) {
      return metric;
    }
    return this._noopMetric;
  }

  _init(uid: number) {
    this._metrics[uid] = this._metrics[asyncHooks.executionAsyncId()];
  }

  _destroy(uid: number) {
    delete this._metrics[uid];
  }
}

let metrics = new Metrics();

export function setActiveMetric(metric: IMetric) {
  return metrics.setActive(metric);
}

export function activeMetric(): IMetric {
  return metrics.active();
}
