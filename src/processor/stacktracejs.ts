import {AirbrakeFrame} from '../notice';
import {Callback} from './processor';

import ErrorStackParser from 'error-stack-parser';


export default function processor(err: Error, cb: Callback): void {
    let frames: any[];
    try {
        frames = ErrorStackParser.parse(err);
    } catch (err) {
        if (console && console.warn) {
            console.warn('airbrake-js: error-stack-parser failed', err);
        }
        frames = [];
    }

    let backtrace: AirbrakeFrame[] = [];
    for (let i in frames) {
        let frame = frames[i];
        backtrace.push({
            function: frame.functionName || '',
            file: frame.fileName,
            line: frame.lineNumber,
            column: frame.columnNumber,
        });
    }

    let type: string;
    if (err.name) {
        type = err.name;
    } else {
        type = '';
    }

    let msg: string;
    if (err.message) {
        msg = String(err.message);
    } else {
        msg = String(err);
    }

    if (type === '' && msg === '' && backtrace.length === 0) {
        if (console && console.warn) {
            console.warn('airbrake: can not process error', err);
        }
        return;
    }

    cb('stacktracejs', {
        type: type,
        message: msg,
        backtrace: backtrace,
    });
}
