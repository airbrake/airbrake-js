import { Notifier } from '../notifier';

export function instrumentUnhandledrejection(notifier: Notifier): void {
  const handler = onUnhandledrejection.bind(notifier);

  window.addEventListener('unhandledrejection', handler);
  notifier._onClose.push(() => {
    window.removeEventListener('unhandledrejection', handler);
  });
}

function onUnhandledrejection(e: any): void {
  // Handle native or bluebird Promise rejections
  // https://developer.mozilla.org/en-US/docs/Web/Events/unhandledrejection
  // http://bluebirdjs.com/docs/api/error-management-configuration.html
  let reason = e.reason || (e.detail && e.detail.reason);
  if (!reason) return;

  let msg = reason.message || String(reason);
  if (msg.indexOf && msg.indexOf('airbrake: ') === 0) return;

  if (typeof reason !== 'object' || reason.error === undefined) {
    this.notify({
      error: reason,
      context: {
        unhandledRejection: true,
      },
    });
    return;
  }

  this.notify({ ...reason, context: { unhandledRejection: true } });
}
