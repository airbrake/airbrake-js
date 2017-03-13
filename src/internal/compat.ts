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
