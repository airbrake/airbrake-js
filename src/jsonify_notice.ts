import Notice from './notice';


const FILTERED = '[Filtered]';
const MAX_OBJ_LENGTH = 128;

// jsonifyNotice serializes notice to JSON and truncates params,
// environment and session keys.
export default function jsonifyNotice(
    notice: Notice, {maxLength = 64000, keysBlacklist = []} = {}): string {

    if (notice.errors) {
        for (let i = 0; i < notice.errors.length; i++) {
            let t = new Truncator({keysBlacklist: keysBlacklist});
            notice.errors[i] = t.truncate(notice.errors[i]);
        }
    }

    let s = '';
    let keys = ['context', 'params', 'environment', 'session'];
    for (let level = 0; level < 8; level++) {
        let opts = {level: level, keysBlacklist: keysBlacklist};
        for (let key of keys) {
            let obj = notice[key];
            if (obj) {
                notice[key] = truncate(obj, opts);
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
        `airbrake: notice exceeds max length and can't be truncated`);
    (err as any).params = params;
    throw err;
}

function scale(num: number, level: number): number {
    return (num >> level) || 1;
}

interface TruncatorOptions {
    level?: number;
    keysBlacklist?: any[];
}

class Truncator {
    private maxStringLength = 1024;
    private maxObjectLength = MAX_OBJ_LENGTH;
    private maxArrayLength = MAX_OBJ_LENGTH;
    private maxDepth = 8;

    private keys: string[] = [];
    private keysBlacklist: any[] = [];
    private seen: any[] = [];

    constructor(opts: TruncatorOptions) {
        let level = opts.level || 0;
        this.keysBlacklist = opts.keysBlacklist || [];

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
                return this.truncateString(String(value));
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
            return this.truncateString(value.toString());
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
        for (let i = 0; i < arr.length; i++) {
            let el = arr[i];
            dst.push(this.truncate(el, i.toString(), depth));

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
        for (let key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }
            if (isBlacklisted(key, this.keysBlacklist)) {
                dst[key] = FILTERED;
                continue;
            }

            let value = getAttr(obj, key);

            if (value === undefined || typeof value === 'function') {
                continue;
            }
            dst[key] = this.truncate(value, key, depth);

            length++;
            if (length >= this.maxObjectLength) {
                break;
            }
        }
        return dst;
    }
}

export function truncate(value: any, opts: TruncatorOptions = {}): any {
    let t = new Truncator(opts);
    return t.truncate(value);
}

function getAttr(obj: any, attr: string): any {
    // Ignore browser specific exception trying to read an attribute (#79).
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

function isBlacklisted(key: string, keysBlacklist: any[]): boolean {
    for (let v of keysBlacklist) {
        if (v === key) {
            return true;
        }
        if (v instanceof RegExp) {
            if (key.match(v)) {
                return true;
            }
        }
    }
    return false;
}
