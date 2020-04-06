import { Notifier } from '../src/notifier';

describe('Notifier', () => {
  describe('configuration', () => {
    describe('performanceStats', () => {
      test('is enabled by default', () => {
        const notifier = new Notifier({
          projectId: 1,
          projectKey: 'key',
        });
        expect(notifier._opt.performanceStats).toEqual(true);
      });

      test('sets up instrumentation when enabled', () => {
        Notifier.prototype._instrument = jest.fn();
        const notifier = new Notifier({
          projectId: 1,
          projectKey: 'key',
        });
        expect(notifier._instrument.mock.calls.length).toEqual(1);
      });

      test('can be disabled', () => {
        const notifier = new Notifier({
          projectId: 1,
          projectKey: 'key',
          performanceStats: false,
        });
        expect(notifier._opt.performanceStats).toEqual(false);
      });

      test('does not set up instrumentation when disabled', () => {
        Notifier.prototype._instrument = jest.fn();
        const notifier = new Notifier({
          projectId: 1,
          projectKey: 'key',
          performanceStats: false,
        });
        expect(notifier._instrument.mock.calls.length).toEqual(0);
      });
    });
  });
});
