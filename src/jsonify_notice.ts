import Notice from './notice';


// jsonifyNotice serializes notice to JSON and truncates params,
// environment and session keys.
export default function jsonifyNotice(notice: Notice, maxLength = 64000): string {
    let s = '';
    for (let level = 0; level < 8; level++) {
        notice.context = truncateObj(notice.context, level);
        notice.params = truncateObj(notice.params, level);
        notice.environment = truncateObj(notice.environment, level);
        notice.session = truncateObj(notice.session, level);

        s = JSON.stringify(notice);
        if (s.length < maxLength) {
            return s;
        }
    }

    let err = new Error(
        `airbrake-js: cannot jsonify notice (length=${s.length} maxLength=${maxLength})`);
    (err as any).params = {
        json: s.slice(0, Math.floor(maxLength / 2)) + '...',
    };
    throw err;
}

// truncateObj truncates each key in the object separately, which is
// useful for handling circular references.
function truncateObj(obj: any, level: number): any {
    let dst = {};
    for (let attr in obj) {
        dst[attr] = truncate(obj[attr], level);
    }
    return dst;
}

class Truncator {
    private maxStringLength = 1024;
    private maxObjectLength = 128;
    private maxArrayLength = 32;
    private maxDepth = 8;

    private keys: string[] = [];
    private seen: any[] = [];

    constructor(level = 0) {
        this.maxStringLength = (this.maxStringLength >> level) || 1;
        this.maxObjectLength = (this.maxObjectLength >> level) || 1;
        this.maxArrayLength = (this.maxArrayLength >> level) || 1;
        this.maxDepth = (this.maxDepth >> level) || 1;
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

    private truncateArray(arr: any[], depth: number): any[] {
        let length = 0;
        let dst: any = [];
        for (let i in arr) {
            let el = arr[i];

            length++;
            if (length >= this.maxArrayLength) {
                break;
            }

            dst.push(this.truncate(el, i, depth));
        }
        return dst;
    }

    private truncateObject(obj: any, depth: number): any {
        let length = 0;
        let dst = {};
        for (let attr in obj) {
            let value = getAttr(obj, attr);

            if (value === undefined || typeof value === 'function') {
                continue;
            }

            length++;
            if (length >= this.maxObjectLength) {
                break;
            }

            dst[attr] = this.truncate(value, attr, depth);
        }
        return dst;
    }
}

export function truncate(value: any, level?: number): any {
    let t = new Truncator(level);
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

function objectType(obj: any): string {
    let s = Object.prototype.toString.apply(obj);
    return s.slice('[object '.length, -1);
}
