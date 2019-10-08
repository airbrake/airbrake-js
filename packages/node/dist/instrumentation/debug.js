'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function patch(createDebug, airbrake) {
    var oldInit = createDebug.init;
    createDebug.init = function (debug) {
        oldInit.apply(this, arguments);
        var oldLog = debug.log || createDebug.log;
        debug.log = function abCreateDebug() {
            airbrake.scope().pushHistory({
                type: 'log',
                arguments: arguments,
            });
            return oldLog.apply(this, arguments);
        };
    };
}

exports.patch = patch;
//# sourceMappingURL=debug.js.map
