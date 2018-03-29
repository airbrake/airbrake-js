import {RequestResponse} from 'request';

import Notice from '../notice';
import jsonifyNotice from '../jsonify_notice';

import {ReporterOptions, errors} from './reporter';


let request;
try {
    // Use eval to hide import from Webpack.
    request = eval('require')('request');
} catch (_) {}


let rateLimitReset = 0;


export default function report(notice: Notice, opts: ReporterOptions): Promise<Notice> {
    let utime = Date.now() / 1000;
    if (utime < rateLimitReset) {
        return Promise.reject(errors.ipRateLimited);
    }

    let url = `${opts.host}/api/v3/projects/${opts.projectId}/notices?key=${opts.projectKey}`;
    let payload = jsonifyNotice(notice);

    return new Promise((resolve, reject) => {
        request({
            url: url,
            method: 'POST',
            body: payload,
            headers: {
                'content-type': 'application/json'
            },
            timeout: opts.timeout,
        }, function (error: any, response: RequestResponse, body: any): void {
            if (error) {
                reject(error);
                return;
            }

            if (!response.statusCode) {
                let err = new Error('airbrake: node: statusCode is null or undefined');
                reject(err);
                return;
            }

            if (response.statusCode === 401) {
                reject(errors.unauthorized);
                return;
            }

            if (response.statusCode === 429) {
                reject(errors.ipRateLimited);

                let h = response.headers['x-ratelimit-delay'];
                if (!h) {
                    return;
                }

                let s: string;
                if (typeof h === 'string') {
                    s = h;
                } else if (h instanceof Array) {
                    s = h[0];
                } else {
                    return;
                }

                let n = parseInt(s, 10);
                if (n > 0) {
                    rateLimitReset = Date.now() / 1000 + n;
                }

                return;
            }

            if (response.statusCode >= 200 && response.statusCode < 500) {
                let resp;
                try {
                    resp = JSON.parse(body);
                } catch (err) {
                    reject(err);
                    return;
                }
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
            }

            body = body.trim();
            let err = new Error(
                `airbrake: node: unexpected response: code=${response.statusCode} body='${body}'`);
            reject(err);
        });
    });
}
