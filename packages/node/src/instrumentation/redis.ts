import { Notifier } from '../notifier';

const SPAN_NAME = 'redis';

export function patch(redis, airbrake: Notifier) {
  let proto = redis.RedisClient.prototype;
  let origSendCommand = proto.internal_send_command;
  proto.internal_send_command = function ab_internal_send_command(cmd) {
    let metric = airbrake.activeMetric();
    metric.startSpan(SPAN_NAME);

    if (cmd && cmd.callback) {
      let origCb = cmd.callback;
      cmd.callback = function abCallback() {
        metric.endSpan(SPAN_NAME);
        return origCb.apply(this, arguments);
      };
    }

    return origSendCommand.apply(this, arguments);
  };

  return redis;
}
