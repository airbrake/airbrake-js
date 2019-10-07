import { Notifier } from '../src/notifier';

describe('Notifier config', () => {
  const reporter = jest.fn(() => Promise.resolve({ errors: [] }));
  const err = new Error('test');
  let client;

  test('throws when projectId or projectKey are missing', () => {
    expect(() => {
      new Notifier({});
    }).toThrow('airbrake: projectId and projectKey are required');
  });

  test('calls a reporter', () => {
    client = new Notifier({
      projectId: 1,
      projectKey: 'abc',
      reporter,
    });
    client.notify(err);

    expect(reporter.mock.calls.length).toBe(1);
  });

  test('supports environment', () => {
    client = new Notifier({
      projectId: 1,
      projectKey: 'abc',
      reporter,
      environment: 'production',
    });

    client.notify(err);

    expect(reporter.mock.calls.length).toBe(1);
    let notice = reporter.mock.calls[0][0];
    expect(notice.context.environment).toBe('production');
  });

  describe('keysBlacklist', () => {
    function test(keysBlacklist) {
      client = new Notifier({
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

      expect(reporter.mock.calls.length).toBe(1);
      let notice = reporter.mock.calls[0][0];
      expect(notice.params).toStrictEqual({
        key1: '[Filtered]',
        key2: 'value2',
        key3: { key1: '[Filtered]' },
      });
    }

    it('supports exact match', () => {
      test(['key1']);
    });

    it('supports regexp match', () => {
      test([/key1/]);
    });
  });
});

describe('Notifier', () => {
  let reporter;
  let client;
  let theErr = new Error('test');

  beforeEach(() => {
    reporter = jest.fn(() => {
      return Promise.resolve({ id: 1 });
    });
    client = new Notifier({
      projectId: 1,
      projectKey: 'abc',
      reporter,
    });
  });

  describe('filter', () => {
    it('returns null to ignore notice', () => {
      let filter = jest.fn((_) => null);
      client.addFilter(filter);

      client.notify({});

      expect(filter.mock.calls.length).toBe(1);
      expect(reporter.mock.calls.length).toBe(0);
    });

    it('returns notice to keep it', () => {
      let filter = jest.fn((notice) => notice);
      client.addFilter(filter);

      client.notify({});

      expect(filter.mock.calls.length).toBe(1);
      expect(reporter.mock.calls.length).toBe(1);
    });

    it('returns notice to change payload', () => {
      let filter = jest.fn((notice) => {
        notice.context.environment = 'production';
        return notice;
      });
      client.addFilter(filter);

      client.notify({});

      expect(filter.mock.calls.length).toBe(1);
      let notice = reporter.mock.calls[0][0];
      expect(notice.context.environment).toBe('production');
    });

    it('returns new notice to change payload', () => {
      let newNotice = { errors: [] };
      let filter = jest.fn((_) => {
        return newNotice;
      });
      client.addFilter(filter);

      client.notify({});

      expect(filter.mock.calls.length).toBe(1);
      let notice = reporter.mock.calls[0][0];
      expect(notice).toEqual(newNotice);
    });
  });

  describe('"Uncaught ..." error message', () => {
    beforeEach(() => {
      let msg =
        'Uncaught SecurityError: Blocked a frame with origin "https://airbrake.io" from accessing a cross-origin frame.';
      client.notify({ type: '', message: msg });
    });

    it('splitted into type and message', () => {
      expect(reporter.mock.calls.length).toBe(1);
      let notice = reporter.mock.calls[0][0];
      let err = notice.errors[0];
      expect(err.type).toBe('SecurityError');
      expect(err.message).toBe(
        'Blocked a frame with origin "https://airbrake.io" from accessing a cross-origin frame.',
      );
    });
  });

  describe('Angular error message', () => {
    beforeEach(() => {
      let msg = `[$injector:undef] Provider '$exceptionHandler' must return a value from $get factory method.\nhttp://errors.angularjs.org/1.4.3/$injector/undef?p0=%24exceptionHandler`;
      client.notify({ type: 'Error', message: msg });
    });

    it('splitted into type and message', () => {
      expect(reporter.mock.calls.length).toBe(1);
      let notice = reporter.mock.calls[0][0];
      let err = notice.errors[0];
      expect(err.type).toBe('$injector:undef');
      expect(err.message).toBe(
        `Provider '$exceptionHandler' must return a value from $get factory method.\nhttp://errors.angularjs.org/1.4.3/$injector/undef?p0=%24exceptionHandler`,
      );
    });
  });

  describe('severity', () => {
    it('defaults to "error"', () => {
      client.notify(theErr);
      let reported = reporter.mock.calls[0][0];
      expect(reported.context.severity).toBe('error');
    });

    it('can be overriden', () => {
      let customSeverity = 'emergency';

      client.addFilter((n) => {
        n.context.severity = customSeverity;
        return n;
      });

      client.notify(theErr);
      let reported = reporter.mock.calls[0][0];
      expect(reported.context.severity).toBe(customSeverity);
    });
  });

  describe('notify', () => {
    it('calls reporter', () => {
      client.notify(theErr);
      expect(reporter.mock.calls.length).toBe(1);
    });

    it('returns promise and resolves it', (done) => {
      let promise = client.notify(theErr);
      let onResolved = jest.fn();
      promise.then(onResolved);
      setTimeout(() => {
        expect(onResolved.mock.calls.length).toBe(1);
        done();
      }, 0);
    });

    it('does not report same error twice', (done) => {
      client.notify(theErr);
      expect(reporter.mock.calls.length).toBe(1);

      let promise = client.notify(theErr);
      promise.then((notice) => {
        expect(notice.error.toString()).toBe(
          'Error: airbrake: error is filtered',
        );
        done();
      });
    });

    it('ignores falsey error', (done) => {
      let promise = client.notify('');
      expect(reporter.mock.calls.length).toBe(0);

      promise.then((notice) => {
        expect(notice.error.toString()).toBe(
          'Error: airbrake: got err="", wanted an Error',
        );
        done();
      });
    });

    it('reports severity', () => {
      client.notify({ error: theErr, context: { severity: 'warning' } });

      let notice = reporter.mock.calls[0][0];
      expect(notice.context.severity).toBe('warning');
    });

    it('reports userAgent', () => {
      client.notify(theErr);

      let notice = reporter.mock.calls[0][0];
      expect(notice.context.userAgent).toContain('Mozilla');
    });

    it('reports text error', () => {
      client.notify('hello');

      expect(reporter.mock.calls.length).toBe(1);
      let notice = reporter.mock.calls[0][0];
      let err = notice.errors[0];
      expect(err.message).toBe('hello');
      expect(err.backtrace.length).not.toBe(0);
    });

    it('ignores "Script error" message', () => {
      client.notify('Script error');

      expect(reporter.mock.calls.length).toBe(0);
    });

    it('ignores "InvalidAccessError" message', () => {
      client.notify('InvalidAccessError');

      expect(reporter.mock.calls.length).toBe(0);
    });

    it('ignores errors occurred in <anonymous> file', () => {
      client.notify({ message: 'test', fileName: '<anonymous>' });

      expect(reporter.mock.calls.length).toBe(0);
    });

    describe('custom data in the filter', () => {
      it('reports context', () => {
        client.addFilter((n) => {
          n.context.context_key = '[custom_context]';
          return n;
        });
        client.notify(theErr);

        let reported = reporter.mock.calls[0][0];
        expect(reported.context.context_key).toEqual('[custom_context]');
      });

      it('reports environment', () => {
        client.addFilter((n) => {
          n.environment.env_key = '[custom_env]';
          return n;
        });
        client.notify(theErr);

        let reported = reporter.mock.calls[0][0];
        expect(reported.environment.env_key).toEqual('[custom_env]');
      });

      it('reports params', () => {
        client.addFilter((n) => {
          n.params.params_key = '[custom_params]';
          return n;
        });
        client.notify(theErr);

        let reported = reporter.mock.calls[0][0];
        expect(reported.params.params_key).toEqual('[custom_params]');
      });

      it('reports session', () => {
        client.addFilter((n) => {
          n.session.session_key = '[custom_session]';
          return n;
        });
        client.notify(theErr);

        let reported = reporter.mock.calls[0][0];
        expect(reported.session.session_key).toEqual('[custom_session]');
      });
    });

    describe('wrapped error', () => {
      it('unwraps and processes error', () => {
        client.notify({ error: theErr });
        expect(reporter.mock.calls.length).toBe(1);
      });

      it('ignores falsey error', (done) => {
        let promise = client.notify({ error: null, params: { foo: 'bar' } });

        expect(reporter.mock.calls.length).toBe(0);

        promise.then((notice) => {
          expect(notice.error.toString()).toBe(
            'Error: airbrake: got err=null, wanted an Error',
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
          error: theErr,
          context: {
            context1: 'notify_value1',
            context3: 'notify_value3',
          },
        });

        let reported = reporter.mock.calls[0][0];
        expect(reported.context.context1).toBe('value1');
        expect(reported.context.context2).toBe('value2');
        expect(reported.context.context3).toBe('notify_value3');
      });

      it('reports custom environment', () => {
        client.addFilter((n) => {
          n.environment.env1 = 'value1';
          n.environment.env2 = 'value2';
          return n;
        });

        client.notify({
          error: theErr,
          environment: {
            env1: 'notify_value1',
            env3: 'notify_value3',
          },
        });

        let reported = reporter.mock.calls[0][0];
        expect(reported.environment).toStrictEqual({
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
          error: theErr,
          params: {
            param1: 'notify_value1',
            param3: 'notify_value3',
          },
        });

        let params = reporter.mock.calls[0][0].params;
        expect(params.param1).toBe('value1');
        expect(params.param2).toBe('value2');
        expect(params.param3).toBe('notify_value3');
      });

      it('reports custom session', () => {
        client.addFilter((n) => {
          n.session.session1 = 'value1';
          n.session.session2 = 'value2';
          return n;
        });

        client.notify({
          error: theErr,
          session: {
            session1: 'notify_value1',
            session3: 'notify_value3',
          },
        });

        let reported = reporter.mock.calls[0][0];
        expect(reported.session).toStrictEqual({
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
      client.notify(theErr);
      expect(reporter.mock.calls.length).toBe(1);
      notice = reporter.mock.calls[0][0];
    });

    it('reports context.url', () => {
      expect(notice.context.url).toEqual('http://localhost/');
    });

    it('reports context.rootDirectory', () => {
      expect(notice.context.rootDirectory).toEqual('http://localhost');
    });
  });

  describe('wrap', () => {
    it('does not invoke function immediately', () => {
      let fn = jest.fn();
      client.wrap(fn);
      expect(fn.mock.calls.length).toBe(0);
    });

    it('creates wrapper that invokes function with passed args', () => {
      let fn = jest.fn();
      let wrapper = client.wrap(fn);
      wrapper('hello', 'world');
      expect(fn.mock.calls.length).toBe(1);
      expect(fn.mock.calls[0]).toEqual(['hello', 'world']);
    });

    it('sets _airbrake and inner properties', () => {
      let fn = jest.fn();
      let wrapper = client.wrap(fn);
      expect(wrapper._airbrake).toEqual(true);
      expect(wrapper.inner).toEqual(fn);
    });

    it('copies function properties', () => {
      let fn = jest.fn();
      fn.prop = 'hello';
      let wrapper = client.wrap(fn);
      expect(wrapper.prop).toEqual('hello');
    });

    it('reports throwed exception', () => {
      let spy = jest.fn();
      client.notify = spy;
      let fn = () => {
        throw theErr;
      };
      let wrapper = client.wrap(fn);
      try {
        wrapper('hello', 'world');
      } catch (_) {
        // ignore
      }

      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0]).toEqual([
        {
          error: theErr,
          params: { arguments: ['hello', 'world'] },
        },
      ]);
    });

    it('wraps arguments', () => {
      let fn = jest.fn();
      let wrapper = client.wrap(fn);
      let arg1 = () => null;
      wrapper(arg1);

      expect(fn.mock.calls.length).toBe(1);
      let arg1Wrapper = fn.mock.calls[0][0];
      expect(arg1Wrapper._airbrake).toEqual(true);
      expect(arg1Wrapper.inner).toEqual(arg1);
    });
  });

  describe('call', () => {
    it('reports throwed exception', () => {
      let spy = jest.fn();
      client.notify = spy;
      let fn = () => {
        throw theErr;
      };
      try {
        client.call(fn, 'hello', 'world');
      } catch (_) {
        // ignore
      }

      expect(spy.mock.calls.length).toBe(1);
      expect(spy.mock.calls[0]).toEqual([
        {
          error: theErr,
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

      let promise = client.notify(theErr);
      spy = jest.fn();
      promise.then(spy);
    });

    it('causes client to not report errors', () => {
      expect(reporter.mock.calls.length).toBe(0);
    });

    describe('online', () => {
      beforeEach(() => {
        let event = new Event('online');
        window.dispatchEvent(event);
      });

      it('causes client to report queued errors', () => {
        expect(reporter.mock.calls.length).toBe(1);
      });

      it('resolves promise', (done) => {
        setTimeout(() => {
          expect(spy.mock.calls.length).toBe(1);
          done();
        }, 0);
      });
    });
  });
});
