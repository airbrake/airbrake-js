import Notice from '../notice';
import Filter from './filter';

export default function makeFilter(): Filter {
  let lastNoticeJSON: string;
  let timeout;

  return (notice: Notice): Notice | null => {
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
