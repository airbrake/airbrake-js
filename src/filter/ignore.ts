import Notice from '../notice';


const IGNORED_MESSAGES = [
    'Script error',
    'Script error.',
    'InvalidAccessError',
];

export default function filter(notice: Notice): Notice | null {
    let err = notice.errors[0];
    if (err.type === '' && IGNORED_MESSAGES.indexOf(err.message) !== -1) {
        return null;
    }

    if (err.backtrace && err.backtrace.length > 0) {
        let frame = err.backtrace[0];
        if (frame.file === '<anonymous>') {
            return null;
        }
    }

    return notice;
}
