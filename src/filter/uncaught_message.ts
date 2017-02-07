let re = new RegExp([
    '^',
    'Uncaught\\s',
    '(.+?)',      // type
    ':\\s',
    '(.+)',       // message
    '$',
].join(''));


export default function filter(notice: any): any {
    let err = notice.errors[0];
    if (err.type !== '' && err.type !== 'Error') {
        return notice;
    }

    let m = err.message.match(re);
    if (m !== null) {
        err.type = m[1];
        err.message = m[2];
    }

    return notice;
}
