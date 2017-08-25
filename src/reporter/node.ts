import Promise from '../promise';
import Notice from '../notice';
import jsonifyNotice from '../jsonify_notice';

import {ReporterOptions} from './reporter';
import {RequestResponse} from 'request';

let request;
try {
    // Use eval to hide import from Webpack.
    request = eval('require')('request');
} catch (_) {}


let rateLimitReset = 0;
let errIpRateLimited = new Error('airbrake: ip is rate limited');


export default function report(notice: Notice, opts: ReporterOptions, promise: Promise): void {
    let utime = Date.now() / 1000;
    if (utime < rateLimitReset) {
        promise.reject(errIpRateLimited);
        return;
    }

    let url = `${opts.host}/api/v3/projects/${opts.projectId}/notices?key=${opts.projectKey}`;
    let payload = jsonifyNotice(notice);

    request({
        url: url,
        method: 'POST',
        body: payload,
        headers: {
            'content-type': 'application/json'
        },
        timeout: opts.timeout,
    }, function (error: any, response: RequestResponse, body: any) {
        if (error) {
            promise.reject(error);
            return;
        }

        if (!response.statusCode) {
            promise.reject(new Error('airbrake: node: statusCode is undefined'));
            return;
        }

        if (response.statusCode === 429) {
            promise.reject(errIpRateLimited);

            let h = response.headers['x-ratelimit-reset'];
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
                rateLimitReset = n;
            }

            return;
        }

        if (response.statusCode >= 200 && response.statusCode < 500) {
            let resp = JSON.parse(body);
            if (resp.id) {
                notice.id = resp.id;
                promise.resolve(notice);
                return;
            }
            if (resp.error) {
                let err = new Error(resp.error);
                promise.reject(err);
                return;
            }
        }

        body = body.trim();
        let err = new Error(
            `airbrake: node: unexpected response: code=${response.statusCode} body='${body}'`);
        promise.reject(err);
    });
}
