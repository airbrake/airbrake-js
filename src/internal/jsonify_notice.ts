import truncate from './truncate';


// truncateObj truncates each key in the object separately, which is
// useful for handling circular references.
function truncateObj(obj, n = 1000) {
    let dst = {};
    for (let key in obj) {
        dst[key] = truncate(obj[key], n);
    }
    return dst;
}


// jsonifyNotice serializes notice to JSON and truncates params,
// environment and session keys.
export default function jsonifyNotice(notice, n = 1000, maxLength = 64000): string {
    let s: string;
    while (true) {
        notice.params = truncateObj(notice.params, n);
        notice.environment = truncateObj(notice.environment, n);
        notice.session = truncateObj(notice.session, n);

        s = JSON.stringify(notice);
        if (s.length < maxLength) {
            return s;
        }

        if (n === 0) {
            break;
        }
        n = Math.floor(n / 2);
    }

    let err = new Error(`airbrake-js: cannot jsonify notice (length=${s.length} maxLength=${maxLength})`);
    (err as any).params = {
        json: s.slice(0, Math.floor(n / 2)) + '...',
    };
    throw err;
}
