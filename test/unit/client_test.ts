import Client from '../../src/client';
import Options from '../../src/options';

import * as sinon from 'sinon';
import { expect } from './sinon_chai';

describe('Client config', () => {
  let reporter, client: Client;
  let err = new Error('test');

  beforeEach(() => {
    reporter = sinon.spy(() => {
      return Promise.resolve({ id: 1 });
    });
  });

  afterEach(() => {
    if (client) {
      client.close();
    }
  });

  it('throws when projectId or projectKey are missing', () => {
    expect(() => {
      new Client({} as Options);
    }).to.throw('airbrake: projectId and projectKey are required');
  });

  it('calls a reporter', () => {
    client = new Client({
      projectId: 1,
      projectKey: 'abc',
      reporter,
    });
    client.notify(err);

    expect(reporter).to.have.been.called;
  });

  it('supports ignoreWindowError', (done) => {
    client = new Client({
      projectId: 1,
      projectKey: 'abc',
      reporter,
      ignoreWindowError: true,
    });
    let promise = client.notify({
      error: err,
      context: {
        windowError: true,
      },
    });

    expect(reporter).to.not.have.been.called;
    promise.then((notice: any) => {
      expect(notice.error.toString()).to.equal(
        'Error: airbrake: window error is ignored'
      );
      done();
    });
  });

  it('supports environment', () => {
    client = new Client({
      projectId: 1,
      projectKey: 'abc',
      reporter,
      environment: 'production',
    });

    client.notify(err);

    expect(reporter).to.have.been.called;
    let notice = reporter.lastCall.args[0];
    expect(notice.context.environment).to.equal('production');
  });

  describe('keysBlacklist', () => {
    function test(keysBlacklist: any[]) {
      client = new Client({
        projectId: 1,
        projectKey: 'abc',
        reporter,
        keysBlacklist,
      });

      client.notify({
        error: err,
        params: {
          key1: 'value1',
          key2: 'value2',
          key3: { key1: 'value1' },
        },
      });

      expect(reporter).to.have.been.called;
      let notice = reporter.lastCall.args[0];
      expect(notice.params).to.deep.equal({
        key1: '[Filtered]',
        key2: 'value2',
        key3: { key1: '[Filtered]' },
      });
    }

    it('support exact match', () => {
      test(['key1']);
    });

    it('support regexp match', () => {
      test([/key1/]);
    });
  });
});

describe('Client', () => {
  let reporter, client: Client;
  let err = new Error('test');

  beforeEach(() => {
    reporter = sinon.spy(() => {
      return Promise.resolve({ id: 1 });
    });
    client = new Client({
      projectId: 1,
      projectKey: 'abc',
      reporter,
    });
  });

  afterEach(() => {
    client.close();
  });

  describe('filter', () => {
    it('returns null to ignore notice', () => {
      let filter = sinon.spy((_) => null);
      client.addFilter(filter);

      client.notify({});

      expect(filter).to.have.been.called;
      expect(reporter).not.to.have.been.called;
    });

    it('returns notice to keep it', () => {
      let filter = sinon.spy((notice) => notice);
      client.addFilter(filter);

      client.notify({});

      expect(filter).to.have.been.called;
      expect(reporter).to.have.been.called;
    });

    it('returns notice to change payload', () => {
      let filter = sinon.spy((notice) => {
        notice.context.environment = 'production';
        return notice;
      });
      client.addFilter(filter);

      client.notify({});

      expect(filter).to.have.been.called;
      let notice = reporter.lastCall.args[0];
      expect(notice.context.environment).to.equal('production');
    });

    it('returns new notice to change payload', () => {
      let newNotice = { errors: [] };
      let filter = sinon.spy((_) => {
        return newNotice;
      });
      client.addFilter(filter);

      client.notify({});

      expect(filter).to.have.been.called;
      let notice = reporter.lastCall.args[0];
      expect(notice).to.equal(newNotice);
    });
  });

  context('"Uncaught ..." error message', () => {
    beforeEach(() => {
      let msg =
        'Uncaught SecurityError: Blocked a frame with origin "https://airbrake.io" from accessing a cross-origin frame.';
      client.notify({ type: '', message: msg });
    });

    it('splitted into type and message', () => {
      expect(reporter).to.have.been.called;
      let notice = reporter.lastCall.args[0];
      let err = notice.errors[0];
      expect(err.type).to.equal('SecurityError');
      expect(err.message).to.equal(
        'Blocked a frame with origin "https://airbrake.io" from accessing a cross-origin frame.'
      );
    });
  });

  describe('Angular error message', () => {
    beforeEach(() => {
      let msg = `[$injector:undef] Provider '$exceptionHandler' must return a value from $get factory method.\nhttp://errors.angularjs.org/1.4.3/$injector/undef?p0=%24exceptionHandler`;
      client.notify({ type: 'Error', message: msg });
    });

    it('splitted into type and message', () => {
      expect(reporter).to.have.been.called;
      let notice = reporter.lastCall.args[0];
      let err = notice.errors[0];
      expect(err.type).to.equal('$injector:undef');
      expect(err.message).to.equal(
        `Provider '$exceptionHandler' must return a value from $get factory method.\nhttp://errors.angularjs.org/1.4.3/$injector/undef?p0=%24exceptionHandler`
      );
    });
  });

  describe('severity', () => {
    it('defaults to "error"', () => {
      client.notify(err);
      let reported = reporter.lastCall.args[0];
      expect(reported.context.severity).to.equal('error');
    });

    it('can be overriden', () => {
      let customSeverity = 'emergency';

      client.addFilter((n) => {
        n.context.severity = customSeverity;
        return n;
      });

      client.notify(err);
      let reported = reporter.lastCall.args[0];
      expect(reported.context.severity).to.equal(customSeverity);
    });
  });

  describe('notify', () => {
    it('calls reporter', () => {
      client.notify(err);
      expect(reporter).to.have.been.called;
    });

    it('returns promise and resolves it', (done) => {
      let promise = client.notify(err);
      let onResolved = sinon.spy();
      promise.then(onResolved);
      setTimeout(() => {
        expect(onResolved).to.have.been.called;
        done();
      }, 0);
    });

    it('does not report same error twice', (done) => {
      client.notify(err);
      expect(reporter).to.have.been.calledOnce;

      let promise = client.notify(err);
      promise.then((notice: any) => {
        expect(notice.error.toString()).to.equal(
          'Error: airbrake: error is filtered'
        );
        done();
      });
    });

    it('ignores falsey error', (done) => {
      let promise = client.notify('');
      expect(reporter).not.to.have.been.called;

      promise.then((notice: any) => {
        expect(notice.error.toString()).to.equal(
          'Error: airbrake: got err="", wanted an Error'
        );
        done();
      });
    });

    it('reports severity', () => {
      client.notify({ error: err, context: { severity: 'warning' } });

      let notice = reporter.lastCall.args[0];
      expect(notice.context.severity).to.equal('warning');
    });

    it('reports userAgent', () => {
      client.notify(err);

      let notice = reporter.lastCall.args[0];
      expect(notice.context.userAgent).to.contain('HeadlessChrome');
    });

    it('reports text error', () => {
      client.notify('hello');

      expect(reporter).to.have.been.called;
      let notice = reporter.lastCall.args[0];
      let err = notice.errors[0];
      expect(err.message).to.equal('hello');
      expect(err.backtrace.length).to.not.equal(0);
    });

    it('ignores "Script error" message', () => {
      client.notify('Script error');

      expect(reporter).not.to.have.been.called;
    });

    it('ignores "InvalidAccessError" message', () => {
      client.notify('InvalidAccessError');

      expect(reporter).not.to.have.been.called;
    });

    it('ignores errors occurred in <anonymous> file', () => {
      client.notify({ message: 'test', fileName: '<anonymous>' });

      expect(reporter).not.to.have.been.called;
    });

    describe('custom data in the filter', () => {
      it('reports context', () => {
        client.addFilter((n) => {
          n.context.context_key = '[custom_context]';
          return n;
        });
        client.notify(err);

        let reported = reporter.lastCall.args[0];
        expect(reported.context.context_key).to.equal('[custom_context]');
      });

      it('reports environment', () => {
        client.addFilter((n) => {
          n.environment.env_key = '[custom_env]';
          return n;
        });
        client.notify(err);

        let reported = reporter.lastCall.args[0];
        expect(reported.environment.env_key).to.equal('[custom_env]');
      });

      it('reports params', () => {
        client.addFilter((n) => {
          n.params.params_key = '[custom_params]';
          return n;
        });
        client.notify(err);

        let reported = reporter.lastCall.args[0];
        expect(reported.params.params_key).to.equal('[custom_params]');
      });

      it('reports session', () => {
        client.addFilter((n) => {
          n.session.session_key = '[custom_session]';
          return n;
        });
        client.notify(err);

        let reported = reporter.lastCall.args[0];
        expect(reported.session.session_key).to.equal('[custom_session]');
      });
    });

    describe('wrapped error', () => {
      it('unwraps and processes error', () => {
        client.notify({ error: err });
        expect(reporter).to.have.been.called;
      });

      it('ignores falsey error', (done) => {
        let promise = client.notify({ error: null, params: { foo: 'bar' } });

        expect(reporter).not.to.have.been.called;

        promise.then((notice: any) => {
          expect(notice.error.toString()).to.equal(
            'Error: airbrake: got err=null, wanted an Error'
          );
          done();
        });
      });

      it('reports custom context', () => {
        client.addFilter((n) => {
          n.context.context1 = 'value1';
          n.context.context2 = 'value2';
          return n;
        });

        client.notify({
          error: err,
          context: {
            context1: 'notify_value1',
            context3: 'notify_value3',
          },
        });

        let reported = reporter.lastCall.args[0];
        expect(reported.context.context1).to.equal('value1');
        expect(reported.context.context2).to.equal('value2');
        expect(reported.context.context3).to.equal('notify_value3');
      });

      it('reports custom environment', () => {
        client.addFilter((n) => {
          n.environment.env1 = 'value1';
          n.environment.env2 = 'value2';
          return n;
        });

        client.notify({
          error: err,
          environment: {
            env1: 'notify_value1',
            env3: 'notify_value3',
          },
        });

        let reported = reporter.lastCall.args[0];
        expect(reported.environment).to.deep.equal({
          env1: 'value1',
          env2: 'value2',
          env3: 'notify_value3',
        });
      });

      it('reports custom params', () => {
        client.addFilter((n) => {
          n.params.param1 = 'value1';
          n.params.param2 = 'value2';
          return n;
        });

        client.notify({
          error: err,
          params: {
            param1: 'notify_value1',
            param3: 'notify_value3',
          },
        });

        let params = reporter.lastCall.args[0].params;
        expect(params.param1).to.equal('value1');
        expect(params.param2).to.equal('value2');
        expect(params.param3).to.equal('notify_value3');
      });

      it('reports custom session', () => {
        client.addFilter((n) => {
          n.session.session1 = 'value1';
          n.session.session2 = 'value2';
          return n;
        });

        client.notify({
          error: err,
          session: {
            session1: 'notify_value1',
            session3: 'notify_value3',
          },
        });

        let reported = reporter.lastCall.args[0];
        expect(reported.session).to.deep.equal({
          session1: 'value1',
          session2: 'value2',
          session3: 'notify_value3',
        });
      });
    });
  });

  describe('location', () => {
    let notice;

    beforeEach(() => {
      client.notify(err);
      expect(reporter).to.have.been.called;
      notice = reporter.lastCall.args[0];
    });

    it('reports context.url', () => {
      expect(notice.context.url).to.equal('http://localhost:9876/context.html');
    });

    it('reports context.rootDirectory', () => {
      expect(notice.context.rootDirectory).to.equal('http://localhost:9876');
    });
  });

  describe('wrap', () => {
    it('does not invoke function immediately', () => {
      let fn = sinon.spy();
      client.wrap(fn);
      expect(fn).not.to.have.been.called;
    });

    it('creates wrapper that invokes function with passed args', () => {
      let fn = sinon.spy();
      let wrapper: any = client.wrap(fn);
      wrapper('hello', 'world');
      expect(fn).to.have.been.called;
      expect(fn.lastCall.args).to.deep.equal(['hello', 'world']);
    });

    it('sets _airbrake and inner properties', () => {
      let fn = sinon.spy();
      let wrapper = client.wrap(fn);
      expect(wrapper._airbrake).to.equal(true);
      expect(wrapper.inner).to.equal(fn);
    });

    it('copies function properties', () => {
      let fn = sinon.spy();
      (fn as any).prop = 'hello';
      let wrapper: any = client.wrap(fn);
      expect(wrapper.prop).to.equal('hello');
    });

    it('reports throwed exception', () => {
      let spy = sinon.spy();
      client.notify = spy;
      let fn = () => {
        throw err;
      };
      let wrapper: any = client.wrap(fn);
      try {
        wrapper('hello', 'world');
      } catch (err) {}

      expect(spy).to.have.been.called;
      expect(spy.lastCall.args).to.deep.equal([
        {
          error: err,
          params: { arguments: ['hello', 'world'] },
        },
      ]);
    });

    it('wraps arguments', () => {
      let fn = sinon.spy();
      let wrapper: any = client.wrap(fn);
      let arg1 = () => null;
      wrapper(arg1);

      expect(fn).to.have.been.called;
      let arg1Wrapper = fn.lastCall.args[0];
      expect(arg1Wrapper._airbrake).to.equal(true);
      expect(arg1Wrapper.inner).to.equal(arg1);
    });
  });

  describe('call', () => {
    it('reports throwed exception', () => {
      let spy = sinon.spy();
      client.notify = spy;
      let fn = () => {
        throw err;
      };
      try {
        client.call(fn, 'hello', 'world');
      } catch (_) {}

      expect(spy).to.have.been.called;
      expect(spy.lastCall.args).to.deep.equal([
        {
          error: err,
          params: { arguments: ['hello', 'world'] },
        },
      ]);
    });
  });

  describe('offline', () => {
    let spy;

    beforeEach(() => {
      let event = new Event('offline');
      window.dispatchEvent(event);

      let promise = client.notify(err);
      spy = sinon.spy();
      promise.then(spy);
    });

    it('causes client to not report errors', () => {
      expect(reporter).not.to.have.been.called;
    });

    describe('online', () => {
      beforeEach(() => {
        let event = new Event('online');
        window.dispatchEvent(event);
      });

      it('causes client to report queued errors', () => {
        expect(reporter).to.have.been.called;
      });

      it('resolves promise', (done) => {
        setTimeout(() => {
          expect(spy).to.have.been.called;
          done();
        }, 0);
      });
    });
  });

  describe('unhandledrejection event', () => {
    it('notifies about unhandled rejection', (done) => {
      new Promise((_resolve, reject) => {
        reject(err);
      });

      setTimeout(() => {
        expect(reporter).to.have.been.called;
        done();
      }, 0);
    });

    it('does not notify about airbrake rejections', (done) => {
      new Promise((_resolve, reject) => {
        reject(new Error('airbrake: test'));
      });

      setTimeout(() => {
        expect(reporter).not.to.have.been.called;
        done();
      }, 0);
    });

    it('notifies about errors thrown in Promise.then', (done) => {
      Promise.resolve(null).then(() => {
        throw err;
      });

      setTimeout(() => {
        expect(reporter).to.have.been.called;
        done();
      }, 0);
    });

    it('notifies about rejections with no reason', (done) => {
      new Promise((_resolve, reject) => {
        reject();
      });

      setTimeout(() => {
        expect(reporter).to.have.been.called;
        done();
      }, 0);
    });

    it('notifies about errors thrown in Promise.catch', (done) => {
      let p = new Promise((_, reject) => {
        setTimeout(() => {
          reject(null);
        }, 0);
      });
      p.catch(() => {
        throw err;
      });

      setTimeout(() => {
        expect(reporter).to.have.been.called;
        done();
      }, 50);
    });
  });
});
