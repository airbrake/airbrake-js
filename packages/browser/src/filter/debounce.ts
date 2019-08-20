import { INotice } from '../notice';
import { Filter } from './filter';

export function makeDebounceFilter(): Filter {
  let lastNoticeJSON: string;
  let timeout;

  return (notice: INotice): INotice | null => {
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
