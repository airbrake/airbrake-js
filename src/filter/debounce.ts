import Filter from './filter';
import Notice from '../notice';
import jsonifyNotice from '../jsonify_notice';

export default function makeFilter(): Filter {
    let lastNoticeJSON: string;
    let timeout: number;

    return function(notice: Notice): Notice | null {
        let s = jsonifyNotice(notice);
        if (s === lastNoticeJSON) {
            return null;
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        lastNoticeJSON = s;
        timeout = setTimeout(() => {
            lastNoticeJSON = '';
        }, 1000);

        return notice;
    };
}
