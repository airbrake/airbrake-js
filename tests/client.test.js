import Client from '../src/client';

describe('Client config', () => {
  const reporter = jest.fn(() => Promise.resolve({ errors: [] }));
  const err = new Error('test');
  let client;

  afterEach(() => {
    if (client) {
      client.close();
    }
  });

  test('throws when projectId or projectKey are missing', () => {
    expect(() => {
      new Client({});
    }).toThrow('airbrake: projectId and projectKey are required');
  });

  test('calls a reporter', () => {
    client = new Client({
      projectId: 1,
      projectKey: 'abc',
      reporter,
    });
    client.notify(err);

    expect(reporter.mock.calls.length).toBe(1);
  });

  test('supports ignoreWindowError', (done) => {
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

    expect(reporter.mock.calls.length).toBe(0);
    promise.then((notice) => {
      expect(notice.error.toString()).toBe(
        'Error: airbrake: window error is ignored'
      );
      done();
    });
  });

  test('supports environment', () => {
    client = new Client({
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
