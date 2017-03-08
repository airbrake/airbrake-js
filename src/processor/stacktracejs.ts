import {AirbrakeFrame} from '../notice';
import {Callback} from './processor';

import ErrorStackParser = require('error-stack-parser');


const hasConsole = typeof console === 'object' && console.warn;

interface AirbrakeError extends Error {
    functionName?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    noStack?: boolean;
}

function parse(err: Error): ErrorStackParser.StackFrame[] {
    try {
        return ErrorStackParser.parse(err);
    } catch (parseErr) {
        if (hasConsole && err.stack) {
            console.warn('ErrorStackParser:', parseErr.toString(), err.stack);
        }
        return [];
    }
}

export default function processor(err: AirbrakeError, cb: Callback): void {
    let backtrace: AirbrakeFrame[] = [];

    if (!err.noStack) {
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

    cb('stacktracejs', {
        type: type,
        message: msg,
        backtrace: backtrace,
    });
}
