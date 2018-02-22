import Notice from '../notice';

let myProcess, os;
try {
    // Use eval to hide import from Webpack and browserify.
    myProcess = eval('process');
    os = eval('require')('os');
} catch (_) {}


export default function filter(notice: Notice): Notice {
    if (os) {
        notice.context.os = `${os.type()}/${os.release()}`;
        notice.context.architecture = os.arch();
        notice.context.hostname = os.hostname();
    }

    if (myProcess) {
        notice.context.platform = myProcess.platform;
        if (!notice.context.rootDirectory) {
            notice.context.rootDirectory = myProcess.cwd();
        }
        if (myProcess.env.NODE_ENV) {
            notice.context.environment = myProcess.env.NODE_ENV;
        }

        notice.params.process = {
            pid: myProcess.pid,
            cwd: myProcess.cwd(),
            execPath: myProcess.execPath,
            argv: myProcess.argv,
        };
        for (let name in ['uptime', 'cpuUsage', 'memoryUsage']) {
            if (myProcess[name]) {
                notice.params.process[name] = myProcess[name]();
            }
        }
    }

    if (os) {
        notice.params.os = {
            homedir: os.homedir(),
            uptime: os.uptime(),
            freemem: os.freemem(),
            totalmem: os.totalmem(),
            loadavg: os.loadavg(),
        };
    }

    return notice;
}
