import * as request from 'request';

import Notice from '../notice';
import jsonifyNotice from '../jsonify_notice';

import {ReporterOptions, errors} from './reporter';


let requestLib: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;
try {
    // Use eval to hide import from Webpack.
    requestLib = eval('require')('request');
} catch (_) {}


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
        let requestWrapper = opts.request || requestLib;
        requestWrapper({
            url: url,
            method: 'POST',
            body: payload,
            headers: {
                'content-type': 'application/json'
            },
            timeout: opts.timeout
        }, function (error: any, response: request.RequestResponse, body: any): void {
            if (error) {
                notice.error = error;
                resolve(notice);
                return;
            }

            if (!response.statusCode) {
                notice.error = new Error(
                    'airbrake: node: statusCode is null or undefined');
                resolve(notice);
                return;
            }

            if (response.statusCode === 401) {
                notice.error = errors.unauthorized;
                resolve(notice);
                return;
            }

            if (response.statusCode === 429) {
                notice.error = errors.ipRateLimited;
                resolve(notice);

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

            body = body.trim();
            notice.error = new Error(
                `airbrake: node: unexpected response: code=${response.statusCode} body='${body}'`);
            resolve(notice);
        });
    });
}
