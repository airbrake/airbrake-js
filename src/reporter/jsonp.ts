import Promise from '../promise';
import Notice from '../notice';
import jsonifyNotice from '../jsonify_notice';

import {ReporterOptions} from './reporter';


let cbCount = 0;

export default function report(notice: Notice, opts: ReporterOptions, promise: Promise): void {
    cbCount++;

    let cbName = 'airbrakeCb' + String(cbCount);
    window[cbName] = (resp) => {
        try {
            delete window[cbName];
        } catch (_) { // IE
            window[cbName] = undefined;
        }

        if (resp.id) {
            notice.id = resp.id;
            promise.resolve(notice);
            return;
        }
        if (resp.message) {
            let err = new Error(resp.message);
            promise.reject(err);
            return;
        }

        let err = new Error(resp);
        promise.reject(err);
    };

    let payload = encodeURIComponent(jsonifyNotice(notice));
    let url = `${opts.host}/api/v3/projects/${opts.projectId}/create-notice?key=${opts.projectKey}&callback=${cbName}&body=${payload}`;

    let document = window.document;
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.src = url;
    script.onload = () => head.removeChild(script);
    script.onerror = () => {
        head.removeChild(script);
        let err = new Error('airbrake: JSONP script error');
        promise.reject(err);
    };
    head.appendChild(script);
}
