function formatError(err): string {
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


export default function report(notice): void {
    if (!console.log) {
        return
    }
    for (let err in notice.errors) {
        console.log(formatError(err));
    }
}
