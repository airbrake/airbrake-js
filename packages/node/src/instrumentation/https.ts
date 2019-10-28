import { Notifier } from '../notifier';

import { wrapRequest } from './http';

export function patch(https, airbrake: Notifier): void {
  if (https.request) {
    https.request = wrapRequest(https.request, airbrake);
  }
  if (https.get) {
    https.get = wrapRequest(https.get, airbrake);
  }
}
