import { INoticeError } from '../../src/notice';
import processor from '../../src/processor/stacktracejs';

describe('stacktracejs processor', () => {
  let error;

  describe('Error', () => {
    beforeEach(() => {
      try {
        throw new Error('BOOM');
      } catch (err) {
        error = processor(err);
      }
    });

    it('provides type and message', () => {
      expect(error.type).toBe('Error');
      expect(error.message).toBe('BOOM');
    });

    it('provides backtrace', () => {
      let backtrace = error.backtrace;
      expect(backtrace.length).toBe(5);

      let frame = backtrace[0];
      expect(frame.file).toContain('tests/processor/stacktracejs.test');
      expect(frame.function).toBe('Object.<anonymous>');
      expect(frame.line).toEqual(expect.any(Number));
      expect(frame.column).toEqual(expect.any(Number));
    });
  });

  describe('text', () => {
    beforeEach(() => {
      let err;
      err = 'BOOM';

      error = processor(err);
    });

    it('uses text as error message', () => {
      expect(error.type).toBe('');
      expect(error.message).toBe('BOOM');
    });

    it('provides backtrace', () => {
      let backtrace = error.backtrace;
      expect(backtrace.length).toBe(4);
    });
  });
});