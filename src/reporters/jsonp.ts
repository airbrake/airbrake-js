import jsonifyNotice from '../internal/jsonify_notice';


let cbCount = 0;

export default function report(notice, opts, promise): void {
    cbCount++;

    let cbName = 'airbrakeCb' + String(cbCount);
    window[cbName] = (resp) => {
        notice.id = resp.id;
        promise.resolve(notice);
        try {
            delete window[cbName];
        } catch (_) { // IE
            window[cbName] = undefined;
        }
    };

    let payload = encodeURIComponent(jsonifyNotice(notice));
    let url = `${opts.host}/api/v3/projects/${opts.projectId}/create-notice?key=${opts.projectKey}&callback=${cbName}&body=${payload}`;

    let document = window.document;
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.src = url;
    let removeScript = () => head.removeChild(script);
    script.onload = removeScript;
    script.onerror = removeScript;
    head.appendChild(script);
}
