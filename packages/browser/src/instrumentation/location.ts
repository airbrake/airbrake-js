import { Notifier } from '../notifier';

let lastLocation = '';

// In some environments (i.e. Cypress) document.location may sometimes be null
function getCurrentLocation(): string | null {
  return document.location && document.location.pathname;
}

export function instrumentLocation(notifier: Notifier): void {
  lastLocation = getCurrentLocation();

  const oldFn = window.onpopstate;
  window.onpopstate = function abOnpopstate(_event: PopStateEvent): any {
    const url = getCurrentLocation();
    if (url) {
      recordLocation(notifier, url);
    }
    if (oldFn) {
      return oldFn.apply(this, arguments);
    }
  };

  const oldPushState = history.pushState;
  history.pushState = function abPushState(
    _state: any,
    _title: string,
    url?: string | null
  ): void {
    if (url) {
      recordLocation(notifier, url.toString());
    }
    oldPushState.apply(this, arguments);
  };
}

function recordLocation(notifier: Notifier, url: string): void {
  let index = url.indexOf('://');
  if (index >= 0) {
    url = url.slice(index + 3);
    index = url.indexOf('/');
    url = index >= 0 ? url.slice(index) : '/';
  } else if (url.charAt(0) !== '/') {
    url = '/' + url;
  }

  notifier.scope().pushHistory({
    type: 'location',
    from: lastLocation,
    to: url,
  });
  lastLocation = url;
}
