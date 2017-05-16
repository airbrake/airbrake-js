import Promise from '../promise';
import Notice from '../notice';
import jsonifyNotice from '../jsonify_notice';

import {ReporterOptions} from './reporter';


export default function report(notice: Notice, opts: ReporterOptions, promise: Promise): void {
    let url = `${opts.host}/api/v3/projects/${opts.projectId}/notices?key=${opts.projectKey}`;
    let payload = jsonifyNotice(notice);

    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: payload,
    }).then((req) => {
        if (req.status >= 200 && req.status < 500) {
            req.json().then((resp) => {
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
            });
            return;
        }
        req.text().then((body) => {
            let err = new Error(
                `airbrake: fetch: unexpected response: code=${req.status} body='${body}'`);
            promise.reject(err);
        });
    }).catch((err) => {
        promise.reject(err);
    });
}
