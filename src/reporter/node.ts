import Promise from '../promise';
import Notice from '../notice';
import jsonifyNotice from '../internal/jsonify_notice';

import {ReporterOptions} from './reporter';

let request;
try {
    // Use eval to hide import from Webpack.
    request = eval('require')('request');
} catch (_) {}


export default function report(notice: Notice, opts: ReporterOptions, promise: Promise): void {
    let url = `${opts.host}/api/v3/projects/${opts.projectId}/notices?key=${opts.projectKey}`;
    let payload = jsonifyNotice(notice);

    request({
        url: url,
        method: 'POST',
        body: payload,
        headers: {
            'content-type': 'application/json'
        },
    }, function (error, response, body) {
        if (error) {
            promise.reject(error);
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
            `airbrake: unexpected response: code=${response.statusCode} body='${body}'`);
        promise.reject(err);
    });
}
