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
