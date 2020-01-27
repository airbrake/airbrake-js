import { IFuncWrapper } from '../func_wrapper';
import { Notifier } from '../notifier';

const CONSOLE_METHODS = ['debug', 'log', 'info', 'warn', 'error'];

export function instrumentConsole(notifier: Notifier): void {
  // tslint:disable-next-line:no-this-assignment
  for (let m of CONSOLE_METHODS) {
    if (!(m in console)) {
      continue;
    }

    const oldFn = console[m];
    let newFn = ((...args) => {
      oldFn.apply(console, args);
      notifier.scope().pushHistory({
        type: 'log',
        severity: m,
        arguments: args,
      });
    }) as IFuncWrapper;
    newFn.inner = oldFn;
    console[m] = newFn;
  }
}
