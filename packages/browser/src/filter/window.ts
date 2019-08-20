import { INotice } from '../notice';

export function windowFilter(notice: INotice): INotice {
  if (window.navigator && window.navigator.userAgent) {
    notice.context.userAgent = window.navigator.userAgent;
  }
  if (window.location) {
    notice.context.url = String(window.location);
    // Set root directory to group errors on different subdomains together.
    notice.context.rootDirectory =
      window.location.protocol + '//' + window.location.host;
  }
  return notice;
}
