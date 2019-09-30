interface HistoryRecord {
  type: string;
  date?: Date;
  [key: string]: any;
}

type Map = { [key: string]: any };

export class Scope {
  _context: Map = {};

  _historyMaxLen = 20;
  _history: HistoryRecord[] = [];
  _lastRecord: HistoryRecord;

  clone(): Scope {
    const clone = new Scope();
    clone._context = { ...this._context };
    clone._history = this._history.slice();
    return clone;
  }

  setContext(context: Map) {
    this._context = Object.assign(this._context, context);
  }

  context(): Map {
    const ctx = { ...this._context };
    if (this._history.length > 0) {
      ctx.history = this._history.slice();
    }
    return ctx;
  }

  pushHistory(state: HistoryRecord): void {
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
}
