import {AirbrakeFrame} from '../notice';
import {Callback} from './processor';

import ErrorStackParser = require('error-stack-parser');


const hasConsole = typeof console === 'object' && console.warn;

interface AirbrakeError extends Error {
    functionName?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    __noStack?: boolean;
}

export default function processor(err: AirbrakeError, cb: Callback): void {
    let frames: ErrorStackParser.StackFrame[] = [];
    if (!err.__noStack) {
        try {
            frames = ErrorStackParser.parse(err);
        } catch (_) {
            if (hasConsole && err.stack) {
                console.warn('airbrake-js: cannot parse stack:', err.stack);
            }
        }
    }

    let backtrace: AirbrakeFrame[] = [];
    for (let frame of frames) {
        backtrace.push({
            function: frame.functionName || '',
            file: frame.fileName || '',
            line: frame.lineNumber || 0,
            column: frame.columnNumber || 0,
        });
    }

    if (backtrace.length === 0 && err.fileName && err.lineNumber) {
        backtrace.push({
            function: err.functionName || '',
            file: err.fileName || '',
            line: err.lineNumber || 0,
            column: err.columnNumber || 0,
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

    if ((type === '' && msg === '') || backtrace.length === 0) {
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
