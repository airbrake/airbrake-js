export interface IMetric {
  isRecording(): boolean;
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
    this.endTime = endTime ? endTime : new Date();

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

  end(endTime?: Date): void {
    if (!this.endTime) {
      this.endTime = endTime || new Date();
    }
  }

  isRecording(): boolean {
    return true;
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

export class NoopMetric implements IMetric {
  isRecording(): boolean {
    return false;
  }
  startSpan(_name: string, _startTime?: Date): void {}
  endSpan(_name: string, _startTime?: Date): void {}
  _incGroup(_name: string, _ms: number): void {}
}
