import { INoticeError } from '../../src/notice';
import { espProcessor } from '../../src/processor/esp';

describe('stacktracejs processor', () => {
  let error;

  describe('Error', () => {
    function throwTestError() {
      try {
        throw new Error('BOOM');
      } catch (err) {
        error = espProcessor(err);
      }
    }

    beforeEach(() => {
      throwTestError();
    });

    it('provides type and message', () => {
      expect(error.type).toBe('Error');
      expect(error.message).toBe('BOOM');
    });

    it('provides backtrace', () => {
      let backtrace = error.backtrace;
      expect(backtrace.length).toBeGreaterThanOrEqual(5);

      let frame = backtrace[0];
      expect(frame.file).toContain('tests/processor/stacktracejs.test');
      expect(frame.function).toBe('throwTestError');
      expect(frame.line).toEqual(expect.any(Number));
      expect(frame.column).toEqual(expect.any(Number));
    });
  });

  describe('text', () => {
    beforeEach(() => {
      let err;
      err = 'BOOM';

      error = espProcessor(err);
    });

    it('uses text as error message', () => {
      expect(error.type).toBe('');
      expect(error.message).toBe('BOOM');
    });

    it('provides backtrace', () => {
      let backtrace = error.backtrace;
      expect(backtrace.length).toBeGreaterThanOrEqual(4);
    });
  });
});
