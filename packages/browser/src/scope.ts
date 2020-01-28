import { IMetric, NoopMetric } from './metrics';

interface IHistoryRecord {
  type: string;
  date?: Date;
  [key: string]: any;
}

interface IMap {
  [key: string]: any;
}

export class Scope {
  _noopMetric = new NoopMetric();
  _routeMetric: IMetric;
  _queueMetric: IMetric;

  _context: IMap = {};

  _historyMaxLen = 20;
  _history: IHistoryRecord[] = [];
  _lastRecord: IHistoryRecord;

  clone(): Scope {
    const clone = new Scope();
    clone._context = { ...this._context };
    clone._history = this._history.slice();
    return clone;
  }

  setContext(context: IMap) {
    this._context = { ...this._context, ...context };
  }

  context(): IMap {
    const ctx = { ...this._context };
    if (this._history.length > 0) {
      ctx.history = this._history.slice();
    }
    return ctx;
  }

  pushHistory(state: IHistoryRecord): void {
    if (this._isDupState(state)) {
      if (this._lastRecord.num) {
        this._lastRecord.num++;
      } else {
        this._lastRecord.num = 2;
      }
      return;
    }

    if (!state.date) {
      state.date = new Date();
    }
    this._history.push(state);
    this._lastRecord = state;

    if (this._history.length > this._historyMaxLen) {
      this._history = this._history.slice(-this._historyMaxLen);
    }
  }

  private _isDupState(state): boolean {
    if (!this._lastRecord) {
      return false;
    }
    for (let key in state) {
      if (!state.hasOwnProperty(key) || key === 'date') {
        continue;
      }
      if (state[key] !== this._lastRecord[key]) {
        return false;
      }
    }
    return true;
  }

  routeMetric(): IMetric {
    return this._routeMetric || this._noopMetric;
  }

  setRouteMetric(metric: IMetric) {
    this._routeMetric = metric;
  }

  queueMetric(): IMetric {
    return this._queueMetric || this._noopMetric;
  }

  setQueueMetric(metric: IMetric) {
    this._queueMetric = metric;
  }
}
