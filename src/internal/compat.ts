if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start = 0): number {
        for (let i = start; i < this.length; i++) {
            if (this[i] === obj) {
                return i;
            }
        }
        return -1;
    };
}

if (!Object.assign) {
    Object.assign = function (target, ...args) {
        for (let source of args) {
            if (source) {
                Object.keys(source).forEach(key => target[key] = source[key]);
            }
        }
        return target;
    };
}
