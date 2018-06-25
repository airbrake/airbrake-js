import Notice from '../notice';
import jsonifyNotice from '../jsonify_notice';

import {ReporterOptions} from './reporter';


let cbCount = 0;

export default function report(notice: Notice, opts: ReporterOptions): Promise<Notice> {
    return new Promise((resolve, _reject) => {
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
                resolve(notice);
                return;
            }
            if (resp.message) {
                notice.error = new Error(resp.message);
                resolve(notice);
                return;
            }

            notice.error = new Error(resp);
            resolve(notice);
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
            notice.error = new Error('airbrake: JSONP script error');
            resolve(notice);
        };
        head.appendChild(script);
    });
}
