import Filter from './filter';
import Notice from '../notice';

export default function makeFilter(): Filter {
    let lastNoticeJSON: string;
    let timeout;

    return function(notice: Notice): Notice | null {
        let s = JSON.stringify(notice.errors);
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
