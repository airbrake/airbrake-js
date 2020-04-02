# Airbrake for web browsers

[![Build Status](https://github.com/airbrake/airbrake-js/workflows/Test/badge.svg?branch=master)](https://github.com/airbrake/airbrake-js/actions?query=branch%3Amaster)
[![CDNJS](https://img.shields.io/cdnjs/v/airbrake-js.svg)](https://cdnjs.com/libraries/airbrake-js)

This is the JavaScript notifier for capturing errors in web browsers and reporting them to [Airbrake](http://airbrake.io). For Node.js there is a [separate package](https://github.com/airbrake/airbrake-js/tree/master/packages/node).

<img src="http://f.cl.ly/items/443E2J1D2W3x1E1u3j1u/JS-airbrakeman.jpg" width=800px>

## Installation

Airbrake for web browsers can be installed using yarn:


```sh
yarn add @airbrake/browser
```

or using npm:

```sh
npm install @airbrake/browser
```

## Setup

Starting from v2 @airbrake/browser uses [rollup.js](https://rollupjs.org) to provide 3 separate build formats:

- dist/airbrake.iife.js - a self-executing function, suitable for inclusion as a <script> tag.
- dist/airbrake.esm.js - an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers.
- dist/airbrake.common.js - CommonJS, suitable for Node.js and other bundlers.

Your package manager should automatically pick suitable bundle format based on @airbrake/browser package.json file:

```js
  "main": "dist/airbrake.common.js",
  "web": "dist/airbrake.iife.js",
  "module": "dist/airbrake.esm.js",
  "jsnext:main": "dist/airbrake.esm.js",
  "types": "dist/airbrake.d.ts",
  "source": "src/index.ts",
```

Example configurations can be found in [examples](examples), including:

* [AngularJS](examples/angular)
* [Angular 2+](examples/angular-2)
* [Browserify](examples/browserify)
* [Legacy](examples/legacy)
* [Rails](examples/rails)
* [React](examples/react)
* [Redux](examples/redux)
* [Vue.js](examples/vuejs)

## Basic Usage

First you need to initialize the notifier with the project id and API key taken from [Airbrake.io](https://airbrake.io):

```js
import { Notifier } from '@airbrake/browser';

const airbrake = new Notifier({
  projectId: 1,
  projectKey: 'REPLACE_ME',
  environment: 'production',
});
```

Then you can send a textual message to Airbrake:

```js
let promise = airbrake.notify(`user id=${user_id} not found`);
promise.then(function(notice) {
  if (notice.id) {
    console.log('notice id', notice.id);
  } else {
    console.log('notify failed', notice.error);
  }
});
```

Or report catched errors directly:

```js
try {
  // This will throw if the document has no head tag
  document.head.insertBefore(document.createElement('style'));
} catch(err) {
  airbrake.notify(err);
  throw err;
}
```

Alternatively, you can wrap any code which may throw errors using the client's `wrap` method:

```js
let startApp = function() {
  // This will throw if the document has no head tag.
  document.head.insertBefore(document.createElement('style'));
}
startApp = airbrake.wrap(startApp);

// Any exceptions thrown in startApp will be reported to Airbrake.
startApp();
```

or use `call` shortcut:

```js
let startApp = function() {
  // This will throw if the document has no head tag.
  document.head.insertBefore(document.createElement('style'));
}

airbrake.call(startApp);
```

## Advanced Usage

### Notice Annotations

It's possible to annotate error notices with all sorts of useful information at the time they're captured by supplying it in the object being reported.

```js
try {
  startApp();
} catch (err) {
  airbrake.notify({
    error:       err,
    context:     { component: 'bootstrap' },
    environment: { env1: 'value' },
    params:      { param1: 'value' },
    session:     { session1: 'value' },
  });
  throw err;
}
```

### Severity

[Severity](https://airbrake.io/docs/airbrake-faq/what-is-severity/) allows categorizing how severe an error is. By default, it's set to `error`. To redefine severity, simply overwrite `context/severity` of a notice object. For example:

```js
airbrake.notify({
  error: err,
  context: { severity: 'warning' }
});
```

### Filtering errors

There may be some errors thrown in your application that you're not interested in sending to Airbrake, such as errors thrown by 3rd-party libraries, or by browser extensions run by your users.

The Airbrake notifier makes it simple to ignore this chaff while still processing legitimate errors. Add filters to the notifier by providing filter functions to `addFilter`.

`addFilter` accepts the entire [error notice](https://airbrake.io/docs/api/#create-notice-v3) to be sent to Airbrake, and provides access to the `context`, `environment`, `params`, and `session` values submitted with the notice, as well as the single-element `errors` array with its `backtrace` element and associated backtrace lines.

The return value of the filter function determines whether or not the error notice will be submitted.
  * If a null value is returned, the notice is ignored.
  * Otherwise, the returned notice will be submitted.

An error notice must pass all provided filters to be submitted.

In the following example all errors triggered by admins will be ignored:

```js
airbrake.addFilter(function(notice) {
  if (notice.params.admin) {
    // Ignore errors from admin sessions.
    return null;
  }
  return notice;
});
```

Filters can be also used to modify notice payload, e.g. to set the environment and application version:

```js
airbrake.addFilter(function(notice) {
  notice.context.environment = 'production';
  notice.context.version = '1.2.3';
  return notice;
});
```

### Filtering keys

With `keysBlacklist` option you can specify list of keys containing sensitive information that must be filtered out, e.g.:

```js
var airbrake = new Airbrake.Notifier({
    ...
    keysBlacklist: [
      'password', // exact match
      /secret/, // regexp match
    ],
});
```

### Source maps

Airbrake supports using private and public source maps. Check out our docs for more info:
- [Private source maps](https://airbrake.io/docs/features/private-sourcemaps/)
- [Public source maps](https://airbrake.io/docs/features/public-sourcemaps/)


### Instrumentation

@airbrake/browser automatically instruments `console.log` function calls in order to collect logs and send them with first error. You can disable that behavior using `instrumentation` option:

```js
var airbrake = new Airbrake.Notifier({
  ...
  instrumentation: {
    console: false,
  },
});
```

## Integration

### window.onerror

airbrake-js automatically setups `window.onerror` handler when script is loaded. It also makes sure to call old error handler if there are any. Errors reported by `window.onerror` can be ignored using `ignoreWindowError` option:

```js
var airbrake = new Airbrake.Notifier({ignoreWindowError: true});
```

## FAQ

### What does "Script error" mean?

See https://developer.mozilla.org/en/docs/Web/API/GlobalEventHandlers/onerror#Notes.

## Contributing

Install dependencies:

```bash
yarn install
```

Run unit tests:

```bash
yarn test
```

Build project:

```bash
yarn build
```

## Credits

Airbrake is maintained and funded by [airbrake.io](http://airbrake.io)

Thank you to all [the contributors](https://github.com/airbrake/airbrake-js/contributors).

The names and logos for Airbrake are trademarks of Airbrake Technologies Inc.

# License

Airbrake is Copyright © 2008-2017 Airbrake Technologies Inc. It is free software, and may be redistributed under the terms specified in the MIT-LICENSE file.
