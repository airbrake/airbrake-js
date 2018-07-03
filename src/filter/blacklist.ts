import Filter from './filter';
import Notice from '../notice';


const FILTERED = '[Filtered]';
const KEYS = ['context', 'params', 'environment', 'session'];


export default function makeFilter(keysBlacklist: any[]): Filter {
    return function(notice: Notice): Notice | null {
        for (let key of KEYS) {
            let obj = notice[key];
            if (obj) {
                filterObject(obj, keysBlacklist);
            }
        }
        return notice;
    };
}

function filterObject(obj: any, keysBlacklist: any[]) {
    for (let key in obj) {
        if (isBlacklisted(key, keysBlacklist)) {
            obj[key] = FILTERED;
            continue;
        }

        let value = getAttr(obj, key);
        if (typeof value === 'object') {
            filterObject(value, keysBlacklist);
        }
    }
}

function getAttr(obj: any, attr: string): any {
    // Ignore browser specific exception trying to read an attribute (#79).
    try {
        return obj[attr];
    } catch (_) {
        return;
    }
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
