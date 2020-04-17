import { INotice } from '@airbrake/browser';
import { NOTIFIER_NAME, NOTIFIER_VERSION, NOTIFIER_URL } from '../version';

const os = require('os');

export function nodeFilter(notice: INotice): INotice {
  if (notice.context.notifier) {
    notice.context.notifier.name = NOTIFIER_NAME;
    notice.context.notifier.version = NOTIFIER_VERSION;
    notice.context.notifier.url = NOTIFIER_URL;
  }
  notice.context.os = `${os.type()}/${os.release()}`;
  notice.context.architecture = os.arch();
  notice.context.hostname = os.hostname();

  notice.params.os = {
    homedir: os.homedir(),
    uptime: os.uptime(),
    freemem: os.freemem(),
    totalmem: os.totalmem(),
    loadavg: os.loadavg(),
  };

  notice.context.platform = process.platform;
  if (!notice.context.rootDirectory) {
    notice.context.rootDirectory = process.cwd();
  }

  notice.params.process = {
    pid: process.pid,
    cwd: process.cwd(),
    execPath: process.execPath,
    argv: process.argv,
  };
  ['uptime', 'cpuUsage', 'memoryUsage'].map((name) => {
    if (process[name]) {
      notice.params.process[name] = process[name]();
    }
  });

  return notice;
}
