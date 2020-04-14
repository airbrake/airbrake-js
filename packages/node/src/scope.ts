import { Scope } from '@airbrake/browser';
import * as asyncHooks from 'async_hooks';

export { Scope };

export class ScopeManager {
  _asyncHook: asyncHooks.AsyncHook;
  _scopes: { [id: number]: Scope } = {};

  constructor() {
    this._asyncHook = asyncHooks
      .createHook({
        init: this._init.bind(this),
        destroy: this._destroy.bind(this),
        promiseResolve: this._destroy.bind(this),
      })
      .enable();
  }

  setActive(scope: Scope) {
    const eid = asyncHooks.executionAsyncId();
    this._scopes[eid] = scope;
  }

  active(): Scope {
    const eid = asyncHooks.executionAsyncId();
    return this._scopes[eid];
  }

  _init(aid: number) {
    this._scopes[aid] = this._scopes[asyncHooks.executionAsyncId()];
  }

  _destroy(aid: number) {
    delete this._scopes[aid];
  }
}
