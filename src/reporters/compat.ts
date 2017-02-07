import jsonifyNotice from '../internal/jsonify_notice';


export default function report(notice, opts, promise) {
    let url = `${opts.host}/api/v3/projects/${opts.projectId}/create-notice?key=${opts.projectKey}`;
    let payload = jsonifyNotice(notice);

    let req = new XMLHttpRequest();
    req.open('POST', url, true);
    req.send(payload);
    req.onreadystatechange = () => {
        if (req.readyState === 4 && req.status === 200) {
            let resp = JSON.parse(req.responseText);
            notice.id = resp.id;
            promise.resolve(notice);
        }
    };
}
