# Airbrake JS Changelog

### master

#### browser

- Added the `keysAllowlist` option, which is a counter-part to the
  `keysBlocklist` option. It filters out all the data from the notice except the
  specified keys
  ([#1335](https://github.com/airbrake/airbrake-js/pull/1335))
- Added support for error reporting of "falsey" errors such as `null`, `NaN`,
  `undefined`, `false`, `""`
  ([#1345](https://github.com/airbrake/airbrake-js/pull/1345))
- Added the `instrumentation.unhandledrejection` option, which enables/disables
  the Airbrake handler for the `unhandledrejection` event
  ([#1356](https://github.com/airbrake/airbrake-js/pull/1356))

### [2.1.8] (December 6, 2022)

#### browser

- Fixed relative import issues with Yarn's Plug'n'Play feature
  ([#1135](https://github.com/airbrake/airbrake-js/pull/1135))
- Stop filtering the `context` field in the notice payload. This payload
  contains service information and it should never be modified
  ([#1325](https://github.com/airbrake/airbrake-js/pull/1325))
- Bumped `cross-fetch` dependency to `^3.1.5` (fixes a Dependabot security
  alert) ([#1322](https://github.com/airbrake/airbrake-js/issues/1322))

### [2.1.7] (October 4, 2021)

- [browser/node] Fixed incorrect `yarn.lock` references
  ([#1132](https://github.com/airbrake/airbrake-js/pull/1132))

### [2.1.6] (October 4, 2021)

- [browser] Fixed not being able to attach a response type when sending a
  performance breakdown
  ([#1128](https://github.com/airbrake/airbrake-js/pull/1128))

### [2.1.5] (June 2, 2021)

- [node] Specify which versions of node are supported
  ([#1038](https://github.com/airbrake/airbrake-js/pull/1038))

### [2.1.4] (April 16, 2021)

- [browser] Fixed `TypeError: undefined is not an object (evaluating 'e.searchParams.append')` occurring in old browsers that don't support
  `Object.entries` (such as Internet Explorer)
  ([#1001](https://github.com/airbrake/airbrake-js/pull/1001),
  [#1002](https://github.com/airbrake/airbrake-js/pull/1002))

### [2.1.3] (February 22, 2021)

- [browser/node] Fixed missing library files in v2.1.2

### [2.1.2] (February 22, 2021)

- [browser] Started catching errors in promises that occur in `RemoteSettings`
  ([#949](https://github.com/airbrake/airbrake-js/pull/949))

### [2.1.1] (February 20, 2021)

- [browser] Removed unwanted `debugger` statement in `base_notifier.js` in the
  distribution package
  ([#948](https://github.com/airbrake/airbrake-js/pull/948))

### [2.1.0] (February 19, 2021)

- [browser/node] Added the `queryStats` and the `queueStats` option. They
  allow/forbid reporting of queries or queues, respectively
  ([#945](https://github.com/airbrake/airbrake-js/pull/945))
- [browser/node] Fixed `_ignoreNextWindowError` undefined error when wrapping
  errors ([#944](https://github.com/airbrake/airbrake-js/pull/944))
- [node] Fixed warnings on loading of `notifier.js` when using Webpack
  ([#936](https://github.com/airbrake/airbrake-js/pull/936))

### [2.0.0] (February 18, 2021)

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

### [1.4.2] (December 22, 2020)

#### Changed

- [node] Conditionally initialize ScopeManager
  ([#894](https://github.com/airbrake/airbrake-js/pull/894))
- [browser] Add the ability to disable console tracking via instrumentation
  ([#860](https://github.com/airbrake/airbrake-js/pull/860))

### [1.4.1] (August 10, 2020)

#### Changed

- [browser] Unhandled rejection errors now include `unhandledRejection: true`
  as part of their `context`
  ([#795](https://github.com/airbrake/airbrake-js/pull/795))

### [1.4.0] (July 22, 2020)

#### Changed

- [browser/node] `notify` now includes the `url` property on the returned
  `INotice` object
  ([#780](https://github.com/airbrake/airbrake-js/pull/780))

### [1.3.0] (June 19, 2020)

#### Changed

- [browser/node] Deprecate `keysBlacklist` in favor of `keysBlocklist`

### [1.2.0] (May 29, 2020)

#### Added

- [node] New method to filter performance metrics
  ([#726](https://github.com/airbrake/airbrake-js/pull/726))

### [1.1.3] (May 26, 2020)

#### Changed

- [browser/node] Remove onUnhandledrejection parameter type

### [1.1.2] (May 5, 2020)

#### Fixed

- [browser] Add guard for window being undefined
  ([#684](https://github.com/airbrake/airbrake-js/pull/684))
- [node] Report URL using `req.originalUrl` instead of `req.path` in Express
  apps ([#691](https://github.com/airbrake/airbrake-js/pull/691))

### [1.1.1] (April 28, 2020)

#### Fixed

- [node] Express route stat reporting
  ([#671](https://github.com/airbrake/airbrake-js/pull/671))

### [1.1.0] (April 22, 2020)

#### Changed

- [browser/node] Build process updates. Bumping minor version for this. See
  [#646](https://github.com/airbrake/airbrake-js/pull/646)
- [browser/node] Documentation updates

### [1.0.7] (April 8, 2020)

#### Added

- [node] New config option to disable performance stats

#### Changed

- [browser/node] Build config updates
- [browser/node] Update dependencies
- [browser/node] Documentation updates
- [browser/node] Update linting config

#### Fixed

- [browser] Fix stacktrace test for node v10
- [browser/node] Fix linting errors

### [1.0.6] (November 18, 2019)

### [1.0.4] (November 12, 2019)

### [1.0.3] (November 7, 2019)

### [1.0.2] (October 28, 2019)

### [1.0.1] (October 28, 2019)

### [1.0.0] (October 21, 2019)

[1.0.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.0
[1.0.1]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.1
[1.0.2]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.2
[1.0.3]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.3
[1.0.4]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.4
[1.0.6]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.6
[1.0.7]: https://github.com/airbrake/airbrake-js/releases/tag/v1.0.7
[1.1.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.1.0
[1.1.1]: https://github.com/airbrake/airbrake-js/releases/tag/v1.1.1
[1.1.2]: https://github.com/airbrake/airbrake-js/releases/tag/v1.1.2
[1.1.3]: https://github.com/airbrake/airbrake-js/releases/tag/v1.1.3
[1.2.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.2.0
[1.3.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.3.0
[1.4.0]: https://github.com/airbrake/airbrake-js/releases/tag/v1.4.0
[1.4.1]: https://github.com/airbrake/airbrake-js/releases/tag/v1.4.1
[1.4.2]: https://github.com/airbrake/airbrake-js/releases/tag/v1.4.2
[2.0.0]: https://github.com/airbrake/airbrake-js/releases/tag/v2.0.0
[2.1.0]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.0
[2.1.1]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.1
[2.1.2]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.2
[2.1.3]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.3
[2.1.4]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.4
[2.1.5]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.5
[2.1.6]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.6
[2.1.7]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.7
[2.1.8]: https://github.com/airbrake/airbrake-js/releases/tag/v2.1.8
