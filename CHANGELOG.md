# Changelog

## [Unreleased]

## [2.1.0] - 2020-02-19

- [browser/node] Added the `queryStats` and the `queueStats` option. They
  allow/forbid reporting of queries or queues, respectively
  ([#945](https://github.com/airbrake/airbrake-js/pull/945))
- [browser/node] Fixed `_ignoreNextWindowError` undefined error when wrapping
  errors ([#944](https://github.com/airbrake/airbrake-js/pull/944))
- [node] Fixed warnings on loading of `notifier.js` when using Webpack
  ([#936](https://github.com/airbrake/airbrake-js/pull/936))

## [2.0.0] - 2020-02-18

- [browser/node] Removed deprecated `ignoreWindowError` option
  ([#929](https://github.com/airbrake/airbrake-js/pull/929))
- [browser/node] Removed deprecated `keysBlacklist` option
  ([#930](https://github.com/airbrake/airbrake-js/pull/930))
- [browser/node] Introduced the `remoteConfigHost` option. This option
  configures the host that the notifier fetch remote configuration from.
  ([#940](https://github.com/airbrake/airbrake-js/pull/940))
- [browser/node] Introduced the `apmHost` option. This option configures the
  host that the notifier should send APM events to.
  ([#940](https://github.com/airbrake/airbrake-js/pull/940))
- [browser/node] Introduced the `errorNotifications` option. This options
  configures ability to send errors
  ([#940](https://github.com/airbrake/airbrake-js/pull/940))
- [browser/node] Introduced the `remoteConfig` option. This option configures
  the remote configuration feature
  ([#940](https://github.com/airbrake/airbrake-js/pull/940))
- [browser/node] Added support for the remote configuration feature
  ([#940](https://github.com/airbrake/airbrake-js/pull/940))

## [1.4.2] - 2020-12-22
### Changed
- [node] Conditionally initialize ScopeManager
         ([#894](https://github.com/airbrake/airbrake-js/pull/894))
- [browser] Add the ability to disable console tracking via instrumentation
            ([#860](https://github.com/airbrake/airbrake-js/pull/860))

## [1.4.1] - 2020-08-10
### Changed
- [browser] Unhandled rejection errors now include `unhandledRejection: true`
            as part of their `context`
            ([#795](https://github.com/airbrake/airbrake-js/pull/795))

## [1.4.0] - 2020-07-22
### Changed
- [browser/node] `notify` now includes the `url` property on the returned
                 `INotice` object
                 ([#780](https://github.com/airbrake/airbrake-js/pull/780))

## [1.3.0] - 2020-06-19
### Changed
- [browser/node] Deprecate `keysBlacklist` in favor of `keysBlocklist`

## [1.2.0] - 2020-05-29
### Added
- [node] New method to filter performance metrics
         ([#726](https://github.com/airbrake/airbrake-js/pull/726))

## [1.1.3] - 2020-05-26
### Changed
- [browser/node] Remove onUnhandledrejection parameter type

## [1.1.2] - 2020-05-05
### Fixed
- [browser] Add guard for window being undefined
            ([#684](https://github.com/airbrake/airbrake-js/pull/684))
- [node] Report URL using `req.originalUrl` instead of `req.path` in Express
         apps ([#691](https://github.com/airbrake/airbrake-js/pull/691))

## [1.1.1] - 2020-04-28
### Fixed
- [node] Express route stat reporting
         ([#671](https://github.com/airbrake/airbrake-js/pull/671))

## [1.1.0] - 2020-04-22
### Changed
- [browser/node] Build process updates. Bumping minor version for this. See
                 [#646](https://github.com/airbrake/airbrake-js/pull/646)
- [browser/node] Documentation updates

## [1.0.7] - 2020-04-08
### Added
- [node] New config option to disable performance stats

### Changed
- [browser/node] Build config updates
- [browser/node] Update dependencies
- [browser/node] Documentation updates
- [browser/node] Update linting config

### Fixed
- [browser] Fix stacktrace test for node v10
- [browser/node] Fix linting errors

## [1.0.6] - 2019-11-18

## [1.0.4] - 2019-11-12

## [1.0.3] - 2019-11-07

## [1.0.2] - 2019-10-28

## [1.0.1] - 2019-10-28

## [1.0.0] - 2019-10-21

[Unreleased]: https://github.com/airbrake/airbrake-js/compare/v2.1.0...master
[2.1.0]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.0
[2.0.0]: https://github.com/airbrake/airbrake-js/releases/tag/v2.0.0
[1.4.2]: https://github.com/airbrake/airbrake-js/releases/tag/v1.4.2
[1.4.1]: https://github.com/airbrake/airbrake-js/releases/tag/v1.4.1
[1.4.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.4.0
[1.3.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.3.0
[1.2.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.2.0
[1.1.3]: https://github.com/airbrake/airbrake-js/releases/tag/v1.1.3
[1.1.2]: https://github.com/airbrake/airbrake-js/releases/tag/v1.1.2
[1.1.1]: https://github.com/airbrake/airbrake-js/releases/tag/v1.1.1
[1.1.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.1.0
[1.0.7]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.7
[1.0.6]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.6
[1.0.4]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.4
[1.0.3]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.3
[1.0.2]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.2
[1.0.1]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.1
[1.0.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.0
