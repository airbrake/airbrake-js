import Notice from '../notice';


export default function filter(notice: Notice): Notice {
    let os;
    try {
        os = require('os');
    } catch (_) {}

    if (os) {
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
    }

    if (process) {
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
        for (let name in ['uptime', 'cpuUsage', 'memoryUsage']) {
            if (process[name]) {
                notice.params.process[name] = process[name]();
            }
        }
    }

    return notice;
}
