import Notice from '../notice';


let re = new RegExp([
    '^',
    '\\[(\\$.+)\\]', // type
    '\\s',
    '([\\s\\S]+)',   // message
    '$',
].join(''));


export default function filter(notice: Notice): Notice {
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
