import { INoticeError, INoticeFrame } from '../notice';

import ErrorStackParser from 'error-stack-parser';

const hasConsole = typeof console === 'object' && console.warn;

export interface IStackFrame {
  functionName?: string;
  fileName?: string;
  lineNumber?: number;
  columnNumber?: number;
}

export interface IError extends Error, IStackFrame {
  noStack?: boolean;
}

function parse(err: IError): IStackFrame[] {
  try {
    return ErrorStackParser.parse(err);
  } catch (parseErr) {
    if (hasConsole && err.stack) {
      console.warn('ErrorStackParser:', parseErr.toString(), err.stack);
    }
  }

  if (err.fileName) {
    return [err];
  }

  return [];
}

export function espProcessor(err: IError): INoticeError {
  let backtrace: INoticeFrame[] = [];

  if (err.noStack) {
    backtrace.push({
      function: err.functionName || '',
      file: err.fileName || '',
      line: err.lineNumber || 0,
      column: err.columnNumber || 0,
    });
  } else {
    let frames = parse(err);
    if (frames.length === 0) {
      try {
        throw new Error('fake');
      } catch (fakeErr) {
        frames = parse(fakeErr);
        frames.shift();
        frames.shift();
      }
    }

    for (let frame of frames) {
      backtrace.push({
        function: frame.functionName || '',
        file: frame.fileName || '',
        line: frame.lineNumber || 0,
        column: frame.columnNumber || 0,
      });
    }
  }

  let type: string = err.name ? err.name : '';
  let msg: string = err.message ? String(err.message) : String(err);

  return {
    type,
    message: msg,
    backtrace,
  };
}
