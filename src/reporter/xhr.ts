import Promise from '../promise';
import Notice from '../notice';
import jsonifyNotice from '../internal/jsonify_notice';

import {ReporterOptions} from './reporter';


export default function report(notice: Notice, opts: ReporterOptions, promise: Promise): void {
    let url = `${opts.host}/api/v3/projects/${opts.projectId}/notices?key=${opts.projectKey}`;
    let payload = jsonifyNotice(notice);

    let req = new XMLHttpRequest();
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(payload);
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 201) {
            let resp = JSON.parse(req.responseText);
            notice.id = resp.id;
            promise.resolve(notice);
        }
    };
}
