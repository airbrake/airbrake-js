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
});
