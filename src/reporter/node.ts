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
        if (!error && response.statusCode === 201) {
            let resp = JSON.parse(body);
            notice.id = resp.id;
            promise.resolve(notice);
        }
    });
}
