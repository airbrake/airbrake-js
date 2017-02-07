import ErrorStackParser from 'error-stack-parser';


export default function processor(e, cb): void {
    let frames: any[];
    try {
        frames = ErrorStackParser.parse(e);
    } catch (err) {
        if (console && console.warn) {
            console.warn('airbrake-js: error-stack-parser failed', err);
        }
        frames = [];
    }

    let backtrace = [];
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
    if (e.name) {
        type = e.name;
    } else {
        type = '';
    }

    let msg: string;
    if (e.message) {
        msg = String(e.message);
    } else {
        msg = String(e);
    }

    if (type === '' && msg === '' && backtrace.length === 0) {
        if (console && console.warn) {
            console.warn('airbrake: can not process error', e);
        }
        return;
    }

    cb('stacktracejs', {
        type: type,
        message: msg,
        backtrace: backtrace,
    });
}
