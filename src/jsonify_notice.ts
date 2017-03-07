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

class Truncator {
    private count = 0;
    private maxCount: number;
    private maxDepth: number;

    private keys: string[] = [];
    private seen = [];

    constructor(opts: any) {
        this.maxCount = opts.maxCount;
        this.maxDepth = opts.maxDepth;
    }

    truncate(value: any, key = '', depth = 0): any {
        this.count++;
        if (this.count > this.maxCount) {
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

        if (this.seen.indexOf(value) >= 0) {
            return `[Circular ${this.getPath(value)}]`;
        }

        // At this point value can be either array or object. Check maximum depth.
        depth++;
        if (depth > this.maxDepth) {
            return '[Truncated]';
        }

        this.keys.push(key);
        this.seen.push(value);

        switch (Object.prototype.toString.apply(value)) {
        case '[object Array]':
            return this.truncateArray(value, depth);
        case '[object Object]':
            return this.truncateObject(value, depth);
        default:
            return String(value);
        }
    }

    private getPath(value): string {
        let index = this.seen.indexOf(value);
        let path = [this.keys[index]];
        for (let i = index; i >= 0; i--) {
            let sub = this.seen[i];
            if (sub && getAttr(sub, path[0]) === value) {
                value = sub;
                path.unshift(this.keys[i]);
            }
        }
        return '~' + path.join('.');
    }

    private truncateArray(arr: any[], depth: number): any[] {
        let dst = [];
        for (let i in arr) {
            let el = arr[i];
            this.count++;
            if (this.count >= this.maxCount) {
                break;
            }
            dst.push(this.truncate(el, i, depth));
        }
        return dst;
    }

    private truncateObject(obj: any, depth: number): any {
        let dst = {};
        for (let attr in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, attr)) {
                continue;
            }

            this.count++;
            if (this.count >= this.maxCount) {
                break;
            }

            let value = getAttr(obj, attr);
            if (value !== undefined) {
                dst[attr] = this.truncate(value, attr, depth);
            }
        }
        return dst;
    }
}

export function truncate(value: any, maxCount = 10000, maxDepth = 5): any {
    let t = new Truncator({maxCount: maxCount, maxDepth: maxDepth});
    return t.truncate(value);
}

function getAttr(obj: any, attr: string): any {
    // Ignore browser specific exception trying to read attribute (#79).
    try {
        return obj[attr];
    } catch (_) {
        return;
    }
}
