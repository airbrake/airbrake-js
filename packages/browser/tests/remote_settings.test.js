import { SettingsData } from '../src/remote_settings';

describe('SettingsData', () => {
  describe('merge', () => {
    it('merges JSON with a SettingsData', () => {
      const disabledApm = { settings: [{ name: 'apm', enabled: false }] };
      const enabledApm = { settings: [{ name: 'apm', enabled: true }] };

      const s = new SettingsData(1, disabledApm);
      s.merge(enabledApm);

      expect(s._data).toMatchObject(enabledApm);
    });
  });

  describe('configRoute', () => {
    describe('when config_route in JSON is null', () => {
      it('returns the default route', () => {
        const s = new SettingsData(1, { config_route: null });
        expect(s.configRoute('http://example.com/')).toMatch(
          'http://example.com/2020-06-18/config/1/config.json'
        );
      });
    });

    describe('when config_route in JSON is undefined', () => {
      it('returns the default route', () => {
        const s = new SettingsData(1, { config_route: undefined });
        expect(s.configRoute('http://example.com/')).toMatch(
          'http://example.com/2020-06-18/config/1/config.json'
        );
      });
    });

    describe('when config_route in JSON is an empty string', () => {
      it('returns the default route', () => {
        const s = new SettingsData(1, { config_route: '' });
        expect(s.configRoute('http://example.com/')).toMatch(
          'http://example.com/2020-06-18/config/1/config.json'
        );
      });
    });

    describe('when config_route in JSON is specified', () => {
      it('returns the specified route', () => {
        const s = new SettingsData(1, { config_route: 'ROUTE/cfg.json' });
        expect(s.configRoute('http://example.com/')).toMatch(
          'http://example.com/ROUTE/cfg.json'
        );
      });
    });

    describe('when the given host does not contain an ending slash', () => {
      it('returns the specified route', () => {
        const s = new SettingsData(1, { config_route: 'ROUTE/cfg.json' });
        expect(s.configRoute('http://example.com')).toMatch(
          'http://example.com/ROUTE/cfg.json'
        );
      });
    });
  });

  describe('errorNotifications', () => {
    describe('when the "errors" setting exists', () => {
      describe('and when it is enabled', () => {
        it('returns true', () => {
          const s = new SettingsData(1, {
            settings: [{ name: 'errors', enabled: true }],
          });
          expect(s.errorNotifications()).toBe(true);
        });
      });

      describe('and when it is disabled', () => {
        it('returns false', () => {
          const s = new SettingsData(1, {
            settings: [{ name: 'errors', enabled: false }],
          });
          expect(s.errorNotifications()).toBe(false);
        });
      });
    });

    describe('when the "errors" setting DOES NOT exist', () => {
      it('returns true', () => {
        const s = new SettingsData(1, {});
        expect(s.errorNotifications()).toBe(true);
      });
    });
  });

  describe('performanceStats', () => {
    describe('when the "apm" setting exists', () => {
      describe('and when it is enabled', () => {
        it('returns true', () => {
          const s = new SettingsData(1, {
            settings: [{ name: 'apm', enabled: true }],
          });
          expect(s.performanceStats()).toBe(true);
        });
      });

      describe('and when it is disabled', () => {
        it('returns false', () => {
          const s = new SettingsData(1, {
            settings: [{ name: 'apm', enabled: false }],
          });
          expect(s.performanceStats()).toBe(false);
        });
      });
    });

    describe('when the "errors" setting DOES NOT exist', () => {
      it('returns true', () => {
        const s = new SettingsData(1, {});
        expect(s.performanceStats()).toBe(true);
      });
    });
  });

  describe('errorHost', () => {
    describe('when the "errors" setting exists', () => {
      describe('and when it has an endpoint specified', () => {
        it('returns the endpoint', () => {
          const s = new SettingsData(1, {
            settings: [{ name: 'errors', endpoint: 'http://example.com' }],
          });
          expect(s.errorHost()).toMatch('http://example.com');
        });
      });

      describe('and when it has null endpoint', () => {
        it('returns null', () => {
          const s = new SettingsData(1, {
            settings: [{ name: 'errors', endpoint: null }],
          });
          expect(s.errorHost()).toBe(null);
        });
      });
    });

    describe('when the "errors" setting DOES NOT exist', () => {
      it('returns null', () => {
        const s = new SettingsData(1, {});
        expect(s.errorHost()).toBe(null);
      });
    });
  });

  describe('apmHost', () => {
    describe('when the "apm" setting exists', () => {
      describe('and when it has an endpoint specified', () => {
        it('returns the endpoint', () => {
          const s = new SettingsData(1, {
            settings: [{ name: 'apm', endpoint: 'http://example.com' }],
          });
          expect(s.apmHost()).toMatch('http://example.com');
        });
      });

      describe('and when it has null endpoint', () => {
        it('returns null', () => {
          const s = new SettingsData(1, {
            settings: [{ name: 'apm', endpoint: null }],
          });
          expect(s.apmHost()).toBe(null);
        });
      });
    });

    describe('when the "apm" setting DOES NOT exist', () => {
      it('returns null', () => {
        const s = new SettingsData(1, {});
        expect(s.apmHost()).toBe(null);
      });
    });
  });
});
