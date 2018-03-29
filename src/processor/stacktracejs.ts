import {NoticeError, NoticeFrame} from '../notice';

import ErrorStackParser = require('error-stack-parser');


const hasConsole = typeof console === 'object' && console.warn;

export interface StackFrame {
    functionName?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
}

export interface MyError extends Error, StackFrame {
    noStack?: boolean;
}

function parse(err: MyError): StackFrame[] {
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

export default function processor(err: MyError): NoticeError {
    let backtrace: NoticeFrame[] = [];

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

    return {
        type: type,
        message: msg,
        backtrace: backtrace,
    };
}
