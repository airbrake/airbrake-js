import jsonifyNotice from '../internal/jsonify_notice';


export default function report(notice, opts, promise): void {
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
