import Notice from '../notice';
import jsonifyNotice from '../jsonify_notice';

import {ReporterOptions, errors} from './reporter';


let rateLimitReset = 0;


export default function report(notice: Notice, opts: ReporterOptions): Promise<Notice> {
    let utime = Date.now() / 1000;
    if (utime < rateLimitReset) {
        notice.error = errors.ipRateLimited;
        return Promise.resolve(notice);
    }

    let url = `${opts.host}/api/v3/projects/${opts.projectId}/notices?key=${opts.projectKey}`;
    let payload = jsonifyNotice(notice);

    return new Promise((resolve, _reject) => {
        let req = new XMLHttpRequest();
        req.open('POST', url, true);
        req.timeout = opts.timeout;
        req.onreadystatechange = () => {
            if (req.readyState !== 4) {
                return;
            }

            if (req.status === 401) {
                notice.error = errors.unauthorized;
                resolve(notice);
                return;
            }

            if (req.status === 429) {
                notice.error = errors.ipRateLimited;
                resolve(notice);

                let s = req.getResponseHeader('X-RateLimit-Delay');
                if (!s) {
                    return;
                }

                let n = parseInt(s, 10);
                if (n > 0) {
                    rateLimitReset = Date.now() / 1000 + n;
                }
                return;
            }

            if (req.status >= 200 && req.status < 500) {
                let resp;
                try {
                    resp = JSON.parse(req.responseText);
                } catch (err) {
                    notice.error = err;
                    resolve(notice);
                    return;
                }
                if (resp.id) {
                    notice.id = resp.id;
                    resolve(notice);
                    return;
                }
                if (resp.message) {
                    notice.error = new Error(resp.message);
                    resolve(notice);
                    return;
                }
            }

            let body = req.responseText.trim();
            notice.error = new Error(
                `airbrake: xhr: unexpected response: code=${req.status} body='${body}'`);
            resolve(notice);
        };
        req.send(payload);
    });
}
