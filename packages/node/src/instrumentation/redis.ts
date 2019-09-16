import { Notifier } from '../notifier';

const SPAN_NAME = 'redis';

export function patch(redis, airbrake: Notifier) {
  const proto = redis.RedisClient.prototype;
  const origSendCommand = proto.internal_send_command;
  proto.internal_send_command = function ab_internal_send_command(cmd) {
    const metric = airbrake.activeMetric();
    metric.startSpan(SPAN_NAME);
    if (!metric.isRecording()) {
      return origSendCommand.apply(this, arguments);
    }

    if (cmd && cmd.callback) {
      const origCb = cmd.callback;
      cmd.callback = function abCallback() {
        metric.endSpan(SPAN_NAME);
        return origCb.apply(this, arguments);
      };
    }

    return origSendCommand.apply(this, arguments);
  };

  return redis;
}
