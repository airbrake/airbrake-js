import Notice from '../notice';
import jsonifyNotice from '../jsonify_notice';

import {ReporterOptions, errors} from './reporter';


let rateLimitReset = 0;


export default function report(notice: Notice, opts: ReporterOptions): Promise<Notice> {
    let utime = Date.now() / 1000;
    if (utime < rateLimitReset) {
        return Promise.reject(errors.ipRateLimited);
    }

    let url = `${opts.host}/api/v3/projects/${opts.projectId}/notices?key=${opts.projectKey}`;
    let payload = jsonifyNotice(notice);

    let opt = {
        method: 'POST',
        body: payload,
    };

    return new Promise((resolve, reject) => {
        fetch(url, opt).then((req: Response) => {
            if (req.status === 401) {
                reject(errors.unauthorized);
                return;
            }

            if (req.status === 429) {
                reject(errors.ipRateLimited);

                let s = req.headers.get('X-RateLimit-Delay');
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
                let json;
                try {
                    json = req.json();
                } catch (err) {
                    reject(err);
                    return;
                }
                json.then((resp) => {
                    if (resp.id) {
                        notice.id = resp.id;
                        resolve(notice);
                        return;
                    }
                    if (resp.message) {
                        let err = new Error(resp.message);
                        reject(err);
                        return;
                    }
                });
                return;
            }
            req.text().then((body) => {
                let err = new Error(
                    `airbrake: fetch: unexpected response: code=${req.status} body='${body}'`);
                reject(err);
            });
        }).catch((err) => {
            reject(err);
        });
    });
}
