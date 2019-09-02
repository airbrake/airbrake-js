export class Span {
  name = '';
  startTime: Date;
  endTime: Date;

  _metric: Metric;
  _parent: Span;

  _dur = 0;
  _level = 0;

  constructor(metric: Metric, name: string, startTime: Date = null) {
    this._metric = metric;
    this._parent = null;

    this.name = name;
    this.startTime = startTime;
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

interface IMetric {
  startSpan(name: string, startTime: Date): void;
  endSpan(name: string, endTime: Date): void;
}

export class Metric implements IMetric {
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

  _incGroup(name, ms) {
    this._groups[name] = (this._groups[name] || 0) + ms;
  }

  _duration(): number {
    if (!this.endTime) {
      this.endTime = new Date();
    }
    return this.endTime.getTime() - this.startTime.getTime();
  }
}
