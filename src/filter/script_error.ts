import Notice from '../notice';


let IGNORED_MESSAGES = [
    'Script error',
    'Script error.',
];


export default function filter(notice: Notice): Notice {
    let msg = notice.errors[0].message;
    if (IGNORED_MESSAGES.indexOf(msg) > -1) {
        return null;
    }
    return notice;
}
