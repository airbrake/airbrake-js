import Notice from '../notice';

let os;
try {
    // Use eval to hide import from Webpack.
    os = eval('require')('os');
} catch (_) {}


export default function filter(notice: Notice): Notice {
    if (os) {
        notice.context.os = `${os.type()}/${os.release()}`;
        notice.context.architecture = os.arch();
        notice.context.hostname = os.hostname();
    }
    notice.context.platform = process.platform;

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

    if (os) {
        notice.params.os = {
            homedir: os.homedir(),
            uptime: os.uptime(),
            freemem: os.freemem(),
            totalmem: os.totalmem(),
            cpus: os.cpus(),
            loadavg: os.loadavg(),
        };
    }

    return notice;
}
