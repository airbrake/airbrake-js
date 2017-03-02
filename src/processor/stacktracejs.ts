import {AirbrakeFrame} from '../notice';
import {Callback} from './processor';

import ErrorStackParser = require('error-stack-parser');


const hasConsole = typeof console === 'object' && console.warn;


export default function processor(err: Error, cb: Callback): void {
    let frames: any[];
    try {
        frames = ErrorStackParser.parse(err);
    } catch (err) {
        if (hasConsole) {
            console.warn('airbrake-js: ErrorStackParser failed:', err.toString());
        }
        frames = [];
    }

    let backtrace: AirbrakeFrame[] = [];
    for (let frame of frames) {
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
        if (hasConsole) {
            console.warn('airbrake: can not process error:', err.toString());
        }
        return;
    }

    cb('stacktracejs', {
        type: type,
        message: msg,
        backtrace: backtrace,
    });
}
