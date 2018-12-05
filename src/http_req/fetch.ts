import 'cross-fetch/polyfill';

import {HttpRequest, HttpResponse, errors} from './index';


let rateLimitReset = 0;


export function request(req: HttpRequest): Promise<HttpResponse> {
    let utime = Date.now() / 1000;
    if (utime < rateLimitReset) {
        return Promise.reject(errors.ipRateLimited);
    }

    let opt = {
        method: req.method,
        body: req.body,
    };
    return fetch(req.url, opt).then((resp: Response) => {
        if (resp.status === 401) {
            throw errors.unauthorized;
        }

        if (resp.status === 429) {
            let s = resp.headers.get('X-RateLimit-Delay');
            if (!s) {
                throw errors.ipRateLimited;
            }

            let n = parseInt(s, 10);
            if (n > 0) {
                rateLimitReset = Date.now() / 1000 + n;
            }

            throw errors.ipRateLimited;
        }

        if (resp.status === 204) {
            return {json: null};
        }
        if (resp.status >= 200 && resp.status < 300) {
            return resp.json().then((json) => {
                return {json: json};
            });
        }

        if (resp.status >= 400 && resp.status < 500) {
            return resp.json().then((json) => {
                let err = new Error(json.message);
                throw err;
            });
        }

        return resp.text().then((body) => {
            let err = new Error(
                `airbrake: fetch: unexpected response: code=${resp.status} body='${body}'`);
            throw err;
        });
    });
}
