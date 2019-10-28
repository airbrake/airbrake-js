'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var SPAN_NAME = 'redis';
function patch(redis, airbrake) {
    var proto = redis.RedisClient.prototype;
    var origSendCommand = proto.internal_send_command;
    proto.internal_send_command = function ab_internal_send_command(cmd) {
        var metric = airbrake.scope().routeMetric();
        metric.startSpan(SPAN_NAME);
        if (!metric.isRecording()) {
            return origSendCommand.apply(this, arguments);
        }
        if (cmd && cmd.callback) {
            var origCb_1 = cmd.callback;
            cmd.callback = function abCallback() {
                metric.endSpan(SPAN_NAME);
                return origCb_1.apply(this, arguments);
            };
        }
        return origSendCommand.apply(this, arguments);
    };
    return redis;
}

exports.patch = patch;
//# sourceMappingURL=redis.js.map
