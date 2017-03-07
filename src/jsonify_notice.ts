import Notice from './notice';


// jsonifyNotice serializes notice to JSON and truncates params,
// environment and session keys.
export default function jsonifyNotice(notice: Notice, n = 10000, maxLength = 64000): string {
    let s: string;
    while (true) {
        notice.context = truncateObj(notice.context, n);
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

    let err = new Error(
        `airbrake-js: cannot jsonify notice (length=${s.length} maxLength=${maxLength})`);
    (err as any).params = {
        json: s.slice(0, Math.floor(n / 2)) + '...',
    };
    throw err;
}

// truncateObj truncates each key in the object separately, which is
// useful for handling circular references.
function truncateObj(obj: any, n: number): any {
    let dst = {};
    for (let attr in obj) {
        dst[attr] = truncate(obj[attr], n);
    }
    return dst;
}

export function truncate(value: any, n = 1000, depth = 5): any {
    let nn = 0;
    let keys: string[] = [];
    let seen = [];

    function getPath(value): string {
        let index = seen.indexOf(value);
        let path = [keys[index]];
        for (let i = index; i >= 0; i--) {
            let sub = seen[i];
            if (sub && getAttr(sub, path[0]) === value) {
                value = sub;
                path.unshift(keys[i]);
            }
        }
        return '~' + path.join('.');
    }

    function fn(value, key = '', dd = 0) {
        nn++;
        if (nn > n) {
            return '[Truncated]';
        }

        if (value === null || value === undefined) {
            return value;
        }

        switch (typeof value) {
        case 'boolean':
        case 'number':
        case 'string':
        case 'function':
            return value;
        case 'object':
            break;
        default:
            return String(value);
        }

        if (value instanceof Boolean ||
            value instanceof Number ||
            value instanceof String ||
            value instanceof Date ||
            value instanceof RegExp) {
            return value;
        }

        if (value instanceof Error) {
            return value.toString();
        }

        if (seen.indexOf(value) >= 0) {
            return `[Circular ${getPath(value)}]`;
        }

        // At this point value can be either array or object. Check maximum depth.
        dd++;
        if (dd > depth) {
            return '[Truncated]';
        }

        keys.push(key);
        seen.push(value);
        nn--; // nn was increased above for primitives.

        if (Object.prototype.toString.apply(value) === '[object Array]') {
            let dst = [];
            for (let i in value) {
                let el = value[i];
                nn++;
                if (nn >= n) {
                    break;
                }
                dst.push(fn(el, i, dd));
            }
            return dst;
        }

        let dst = {};
        for (let attr in value) {
            if (!Object.prototype.hasOwnProperty.call(value, attr)) {
                continue;
            }

            nn++;
            if (nn >= n) {
                break;
            }

            let val = getAttr(value, attr);
            if (val !== undefined) {
                dst[attr] = fn(val, attr, dd);
            }
        }

        return dst;
    }

    return fn(value);
}

function getAttr(obj: any, attr: string): any {
    // Ignore browser specific exception trying to read attribute (#79).
    try {
        return obj[attr];
    } catch (_) {
        return;
    }
}
