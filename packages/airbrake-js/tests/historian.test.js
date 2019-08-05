let {fetch, Request} = require('cross-fetch');

window.fetch = fetch

import Client from '../src/client';

class Location {
    constructor(s) {
        this.s = s;
    }

    toString() {
        return this.s;
    }
}

describe('instrumentation', () => {
  let processor;
  let reporter;
  let client;

  beforeEach(() => {
    processor = jest.fn((data) => {
      return data;
    });
    reporter = jest.fn(() => {
      return Promise.resolve({ id: 1 });
    });
    client = new Client({
      projectId: 1,
      projectKey: 'abc',
      processor,
      reporter,
    });
  });

  describe('location', () => {
    beforeEach(() => {
      let locations = ['', 'http://hello/world', 'foo', new Location('/')];
      for (let loc of locations) {
        try {
          window.history.pushState(null, '', loc);
        } catch (_) {
          // ignore
        }
      }
      client.notify(new Error('test'));
    });

    it('records browser history', () => {
      expect(reporter.mock.calls.length).toBe(1);
      let notice = reporter.mock.calls[0][0];
      let history = notice.context.history;

      let state = history[history.length - 3];
      delete state.date;
      expect(state).toStrictEqual({
        type: 'location',
        from: '/',
        to: '/world',
      });

      state = history[history.length - 2];
      delete state.date;
      expect(state).toStrictEqual({
        type: 'location',
        from: '/world',
        to: '/foo',
      });

      state = history[history.length - 1];
      delete state.date;
      expect(state).toStrictEqual({
        type: 'location',
        from: '/foo',
        to: '/',
      });
    });
  });

  describe('XHR', () => {
    beforeEach(() => {
      let promise =  new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();
        req.open('GET', 'http://ip2c.org/self');
        req.onreadystatechange = () => {
          if (req.readyState != 4) return;
          if (req.status == 200) {
            resolve(req.response);
          } else {
            reject();
          }
        };
        req.send();
      });

      promise.then(() => {
        client.notify(new Error('test'));
      });
      return promise;
    });

    it('records request', () => {
      expect(reporter.mock.calls.length).toBe(1);
      let notice = reporter.mock.calls[0][0];
      let history = notice.context.history;

      let state = history[history.length - 1];
      expect(state.type).toBe('xhr');
      expect(state.method).toBe('GET');
      expect(state.url).toBe('http://ip2c.org/self');
      expect(state.statusCode).toBe(200);
      expect(state.duration).toEqual(expect.any(Number));
    });
  });

  describe('fetch', () => {
    describe('simple fetch', () => {
      beforeEach(() => {
        let promise = window.fetch('http://ip2c.org/4.4.4.4');
        promise.then(() => {
          client.notify(new Error('test'));
        });
        return promise;
      });

      it('records request', () => {
        expect(reporter.mock.calls.length).toBe(1);
        let notice = reporter.mock.calls[0][0];
        let history = notice.context.history;

        let state = history[history.length - 1];
        expect(state.type).toBe('xhr');
        expect(state.method).toBe('GET');
        expect(state.url).toBe('http://ip2c.org/4.4.4.4');
        expect(state.statusCode).toBe(200);
        expect(state.duration).toEqual(expect.any(Number));
      });
    });

    describe('fetch with options', () => {
      beforeEach(() => {
        let promise = window.fetch('http://ip2c.org/4.4.4.4', { method: 'POST' });
        promise.then(() => {
          client.notify(new Error('test'));
        });
        return promise;
      });

      it('records request', () => {
        expect(reporter.mock.calls.length).toBe(1);
        let notice = reporter.mock.calls[0][0];
        let history = notice.context.history;

        let state = history[history.length - 1];
        expect(state.type).toBe('xhr');
        expect(state.method).toBe('POST');
        expect(state.url).toBe('http://ip2c.org/4.4.4.4');
        expect(state.statusCode).toBe(200);
        expect(state.duration).toEqual(expect.any(Number));
      });
    });

    describe('fetch with Request object', () => {
      beforeEach(() => {
        const req = new Request('http://ip2c.org/4.4.4.4', {
          method: 'POST',
          body: '{"foo": "bar"}',
        });
        let promise = window.fetch(req);
        promise.then(() => {
          client.notify(new Error('test'));
        });
        return promise;
      });

      it('records request', () => {
        expect(reporter.mock.calls.length).toBe(1);
        let notice = reporter.mock.calls[0][0];
        let history = notice.context.history;

        let state = history[history.length - 1];
        expect(state.type).toBe('xhr');
        expect(state.method).toBe('POST');
        expect(state.url).toBe('http://ip2c.org/4.4.4.4');
        expect(state.statusCode).toBe(200);
        expect(state.duration).toEqual(expect.any(Number));
      });
    });
  });

  describe('console', () => {
    beforeEach(() => {
      for (let i = 0; i < 25; i++) {
        // tslint:disable-next-line:no-console
        console.log(i);
      }
      client.notify(new Error('test'));
    });

    it('records log message', () => {
      expect(reporter.mock.calls.length).toBe(1);
      let notice = reporter.mock.calls[0][0];
      let history = notice.context.history;
      expect(history).toHaveLength(20);

      for (let i in history) {
        if (!history.hasOwnProperty(i)) {
          continue;
        }
        let state = history[i];
        expect(state.type).toBe('log');
        expect(state.severity).toBe('log');
        expect(state.arguments).toStrictEqual([+i + 5]);
        expect(state.date).not.toBeNull();
      }
    });
  });
});
