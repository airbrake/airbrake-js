import { jsonifyNotice } from '../src/jsonify_notice';

describe('jsonify_notice', () => {
  const maxLength = 30000;

  describe('when called with notice', () => {
    let notice = {
      params: { arguments: [] },
      environment: { env1: 'value1' },
      session: { session1: 'value1' },
    };
    let json;

    beforeEach(() => {
      json = jsonifyNotice(notice);
    });

    it('produces valid JSON', () => {
      expect(JSON.parse(json)).toStrictEqual(notice);
    });
  });

  describe('when called with huge notice', () => {
    let json;

    beforeEach(() => {
      let notice = {
        params: { arr: [] },
      };
      for (let i = 0; i < 100; i++) {
        notice.params.arr.push(Array(100).join('x'));
      }
      json = jsonifyNotice(notice, { maxLength });
    });

    it('limits json size', () => {
      expect(json.length).toBeLessThan(maxLength);
    });
  });

  describe('when called with one huge string', () => {
    let json;

    beforeEach(() => {
      let notice = {
        params: { str: Array(100000).join('x') },
      };
      json = jsonifyNotice(notice, { maxLength });
    });

    it('limits json size', () => {
      expect(json.length).toBeLessThan(maxLength);
    });
  });

  describe('when called with huge error message', () => {
    let json;

    beforeEach(() => {
      let notice = {
        errors: [
          {
            type: Array(100000).join('x'),
            message: Array(100000).join('x'),
          },
        ],
      };
      json = jsonifyNotice(notice, { maxLength });
    });

    it('limits json size', () => {
      expect(json.length).toBeLessThan(maxLength);
    });
  });

  describe('when called with huger array', () => {
    let json;

    beforeEach(() => {
      let notice = {
        params: { param1: Array(100000) },
      };
      json = jsonifyNotice(notice, { maxLength });
    });

    it('limits json size', () => {
      expect(json.length).toBeLessThan(maxLength);
    });
  });

  describe('when called with a blocklisted key', () => {
    const notice = {
      params: { name: 'I will be filtered' },
      session: { session1: 'value1' },
      context: { notifier: { name: 'airbrake-js' } },
    };
    let json;

    beforeEach(() => {
      json = jsonifyNotice(notice, { keysBlocklist: ['name'] });
    });

    it('filters out blocklisted keys', () => {
      expect(JSON.parse(json)).toStrictEqual({
        params: { name: '[Filtered]' },
        session: { session1: 'value1' },
        context: { notifier: { name: 'airbrake-js' } },
      });
    });
  });

  describe('keysAllowlist', () => {
    describe('when the allowlist key is a string', () => {
      const notice = {
        params: { name: 'I am allowlisted', email: 'I will be filtered' },
        session: { session1: 'I will be filtered, too' },
        context: { notifier: { name: 'I am allowlisted' } },
      };
      let json;

      beforeEach(() => {
        json = jsonifyNotice(notice, { keysAllowlist: ['name'] });
      });

      it('filters out everything but allowlisted keys', () => {
        expect(JSON.parse(json)).toStrictEqual({
          params: { name: 'I am allowlisted', email: '[Filtered]' },
          session: { session1: '[Filtered]' },
          context: { notifier: { name: 'I am allowlisted' } },
        });
      });
    });

    describe('when the allowlist key is a regexp', () => {
      const notice = {
        params: { name: 'I am allowlisted', email: 'I will be filtered' },
        session: { session1: 'I will be filtered, too' },
        context: { notifier: { name: 'I am allowlisted' } },
      };
      let json;

      beforeEach(() => {
        json = jsonifyNotice(notice, { keysAllowlist: [/nam/] });
      });

      it('filters out everything but allowlisted keys', () => {
        expect(JSON.parse(json)).toStrictEqual({
          params: { name: 'I am allowlisted', email: '[Filtered]' },
          session: { session1: '[Filtered]' },
          context: { notifier: { name: 'I am allowlisted' } },
        });
      });
    });
  });

  describe('when called both with a blocklist and an allowlist', () => {
    const notice = {
      params: { name: 'Name' },
      session: { session1: 'value1' },
      context: { notifier: { name: 'airbrake-js' } },
    };
    let json;

    beforeEach(() => {
      json = jsonifyNotice(notice, {
        keysBlocklist: ['name'],
        keysAllowlist: ['name'],
      });
    });

    it('ignores the blocklist and uses the allowlist', () => {
      expect(JSON.parse(json)).toStrictEqual({
        params: { name: 'Name' },
        session: { session1: '[Filtered]' },
        context: { notifier: { name: 'airbrake-js' } },
      });
    });
  });
});
