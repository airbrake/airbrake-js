import Notice from '../notice';


const IGNORED_MESSAGES = [
    'Script error',
    'Script error.',
    'InvalidAccessError',
];

export default function filter(notice: Notice): Notice | null {
    let err = notice.errors[0];
    if (err.type !== '') {
        return notice;
    }
    if (IGNORED_MESSAGES.indexOf(err.message) > -1) {
        return null;
    }
    return notice;
}
