function getAttr(obj, attr: string) {
    // Ignore browser specific exceptions trying to read attribute (#79).
    try {
        return obj[attr];
    } catch (exc) {
        return undefined;
    }
}

export default function truncate(value, n=1000, depth=5) {
    let nn = 0;
    let keys: string[] = [];
    let seen = [];

    function getPath(value): string {
        let index = seen.indexOf(value);
        let path = [keys[index]];
        for (let i = index; i >= 0; i--) {
            if (seen[i] && getAttr(seen[i], path[0]) === value) {
                value = seen[i];
                path.unshift(keys[i]);
            }
        }
        return '~' + path.join('.');
    }

    function fn(value, key='', dd=0) {
        nn++;
        if (nn > n) {
            return '[Truncated]'
        }

        if (value === null || value === undefined) {
            return value
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
                dst.push(fn(el, key=i, dd));
            }
            return dst;
        }

        let dst = {};
        for (key in value) {
            if (!Object.prototype.hasOwnProperty.call(value, key)) {
                continue;
            }

            nn++;
            if (nn >= n) {
                break;
            }

            let val = getAttr(value, key);
            if (val !== undefined) {
                dst[key] = fn(val, key=key, dd);
            }
        }

        return dst;
    }

    return fn(value);
}
