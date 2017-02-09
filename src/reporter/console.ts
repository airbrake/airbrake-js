import {Notice, AirbrakeError} from '../notice';


function formatError(err: AirbrakeError): string {
    let s: string[] = [];
    s.push(`${err.message}\n`);

    for (let rec of err.backtrace) {
        if (rec.function !== '') {
            s.push(` at ${rec.function}`);
        }
        if (rec.file !== '') {
            s.push(` in ${rec.file}:${rec.line}`);
            if (rec.column !== 0) {
                s.push(`:${rec.column}`);
            }
        }
        s.push('\n');
    }

    return s.join('');
}


export default function report(notice: Notice): void {
    if (!console.log) {
        return
    }
    for (let i in notice.errors) {
        let err = notice.errors[i];
        console.log(formatError(err));
    }
}
