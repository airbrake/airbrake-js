import Notice from './notice';


const maxObjectLength = 128;

// jsonifyNotice serializes notice to JSON and truncates params,
// environment and session keys.
export default function jsonifyNotice(notice: Notice, maxLength = 64000): string {
    let s = '';
    try {
        s = JSON.stringify(notice);
    } catch (_) {}

    if (s !== '' && s.length < maxLength) {
        return s;
    }

    if (notice.errors) {
        for (let i in notice.errors) {
            let t = new Truncator();
            notice.errors[i] = t.truncate(notice.errors[i]);
        }
    }

    let keys = ['context', 'params', 'environment', 'session'];
    for (let level = 0; level < 8; level++) {
        for (let key of keys) {
            let obj = notice[key];
            if (obj) {
                notice[key] = truncateObject(obj, level);
            }
        }

        s = JSON.stringify(notice);
        if (s.length < maxLength) {
            return s;
        }
    }

    let params = {
        json: s.slice(0, Math.floor(maxLength / 2)) + '...',
    };
    keys.push('errors');
    for (let key of keys) {
        let obj = notice[key];
        if (!obj) {
            continue;
        }

        s = JSON.stringify(obj);
        params[key] = s.length;
    }

    let err = new Error(
        `airbrake-js: notice exceeds max length and can't be truncated`);
    (err as any).params = params;
    throw err;
}

// truncateObject truncates each key in the object separately, which is
// useful for handling circular references.
function truncateObject(obj: any, level: number): any {
    const maxLength = scale(maxObjectLength, level);

    let dst = {};
    let length = 0;
    for (let key in obj) {
        dst[key] = truncate(obj[key], level);
        length++;
        if (length >= maxLength) {
            break;
        }
    }
    return dst;
}

function scale(num: number, level: number): number {
    return (num >> level) || 1;
}

export function truncate(value: any, level?: number): any {
    let t = new Truncator(level);
    return t.truncate(value);
}

class Truncator {
    private maxStringLength = 1024;
    private maxObjectLength = maxObjectLength;
    private maxArrayLength = maxObjectLength;
    private maxDepth = 8;

    private keys: string[] = [];
    private seen: any[] = [];

    constructor(level = 0) {
        this.maxStringLength = scale(this.maxStringLength, level);
        this.maxObjectLength = scale(this.maxObjectLength, level);
        this.maxArrayLength = scale(this.maxArrayLength, level);
        this.maxDepth = scale(this.maxDepth, level);
    }

    truncate(value: any, key = '', depth = 0): any {
        if (value === null || value === undefined) {
            return value;
        }

        switch (typeof value) {
        case 'boolean':
        case 'number':
        case 'function':
            return value;
        case 'string':
            return this.truncateString(value);
        case 'object':
            break;
        default:
            return String(value);
        }

        if (value instanceof String) {
            return this.truncateString(value.toString());
        }

        if (value instanceof Boolean ||
            value instanceof Number ||
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

        let type = objectType(value);

        depth++;
        if (depth > this.maxDepth) {
            return `[Truncated ${type}]`;
        }

        this.keys.push(key);
        this.seen.push(value);

        switch (type) {
        case 'Array':
            return this.truncateArray(value, depth);
        case 'Object':
            return this.truncateObject(value, depth);
        default:
            let saved = this.maxDepth;
            this.maxDepth = 0;

            let obj = this.truncateObject(value, depth);
            obj.__type = type;

            this.maxDepth = saved;

            return obj;
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

    private truncateString(s: string): string {
        if (s.length > this.maxStringLength) {
            return s.slice(0, this.maxStringLength) + '...';
        }
        return s;
    }

    private truncateArray(arr: any[], depth = 0): any[] {
        let length = 0;
        let dst: any = [];
        for (let i in arr) {
            let el = arr[i];

            dst.push(this.truncate(el, i, depth));

            length++;
            if (length >= this.maxArrayLength) {
                break;
            }
        }
        return dst;
    }

    private truncateObject(obj: any, depth = 0): any {
        let length = 0;
        let dst = {};
        for (let attr in obj) {
            let value = getAttr(obj, attr);

            if (value === undefined || typeof value === 'function') {
                continue;
            }

            dst[attr] = this.truncate(value, attr, depth);

            length++;
            if (length >= this.maxObjectLength) {
                break;
            }
        }
        return dst;
    }
}

function getAttr(obj: any, attr: string): any {
    // Ignore browser specific exception trying to read attribute (#79).
    try {
        return obj[attr];
    } catch (_) {
        return;
    }
}

function objectType(obj: any): string {
    let s = Object.prototype.toString.apply(obj);
    return s.slice('[object '.length, -1);
}
