<p align="center">
  <img src="https://airbrake-github-assets.s3.amazonaws.com/brand/airbrake-full-logo.png" width="200">
</p>

# Official Airbrake Notifier for Node.js

[![Build Status](https://github.com/airbrake/airbrake-js/workflows/CI/badge.svg?branch=master)](https://github.com/airbrake/airbrake-js/actions?query=branch%3Amaster)
[![npm version](https://img.shields.io/npm/v/@airbrake/node.svg)](https://www.npmjs.com/package/@airbrake/node)

The official Airbrake notifier for capturing JavaScript errors in Node.js and
reporting them to [Airbrake](http://airbrake.io). If you're looking for
browser support, there is a
[separate package](https://github.com/airbrake/airbrake-js/tree/master/packages/browser).

## Installation

Using yarn:

```sh
yarn add @airbrake/node
```

Using npm:

```sh
npm install @airbrake/node
```

## Basic Usage

First, initialize the notifier with the project ID and project key taken from
[Airbrake](https://airbrake.io). To find your `project_id` and `project_key`
navigate to your project's _Settings_ and copy the values from the right
sidebar:

![][project-idkey]

```js
const { Notifier } = require('@airbrake/node');

const airbrake = new Notifier({
  projectId: 1,
  projectKey: 'REPLACE_ME',
  environment: 'production',
});
```

Then, you can send a textual message to Airbrake:

```js
let promise = airbrake.notify(`user id=${user_id} not found`);
promise.then((notice) => {
  if (notice.id) {
    console.log('notice id', notice.id);
  } else {
    console.log('notify failed', notice.error);
  }
});
```

or report errors directly:

```js
try {
  throw new Error('Hello from Airbrake!');
} catch(err) {
  airbrake.notify(err);
}
```

Alternatively, you can wrap any code which may throw errors using the `wrap`
method:

```js
let startApp = () => {
  throw new Error('Hello from Airbrake!');
};
startApp = airbrake.wrap(startApp);

// Any exceptions thrown in startApp will be reported to Airbrake.
startApp();
```

or use the `call` shortcut:

```js
let startApp = () => {
  throw new Error('Hello from Airbrake!');
};

airbrake.call(startApp);
```

## Example configurations

* [Express](examples/express)
* [Node.js](examples/nodejs)

## Advanced Usage

### Notice Annotations

It's possible to annotate error notices with all sorts of useful information at
the time they're captured by supplying it in the object being reported.

```js
try {
  startApp();
} catch(err) {
  airbrake.notify({
    error: err,
    context: { component: 'bootstrap' },
    environment: { env1: 'value' },
    params: { param1: 'value' },
    session: { session1: 'value' },
  });
}
```

### Severity

[Severity](https://airbrake.io/docs/airbrake-faq/what-is-severity/) allows
categorizing how severe an error is. By default, it's set to `error`. To
redefine severity, simply overwrite `context/severity` of a notice object:

```js
airbrake.notify({
  error: err,
  context: { severity: 'warning' }
});
```

### Filtering errors

There may be some errors thrown in your application that you're not interested
in sending to Airbrake, such as errors thrown by 3rd-party libraries.

The Airbrake notifier makes it simple to ignore this chaff while still
processing legitimate errors. Add filters to the notifier by providing filter
functions to `addFilter`.

`addFilter` accepts the entire
[error notice](https://airbrake.io/docs/api/#create-notice-v3) to be sent to
Airbrake and provides access to the `context`, `environment`, `params`,
and `session` properties. It also includes the single-element `errors` array
with  its `backtrace` property and associated backtrace lines.

The return value of the filter function determines whether or not the error
notice will be submitted.
  * If `null` is returned, the notice is ignored.
  * Otherwise, the returned notice will be submitted.

An error notice must pass all provided filters to be submitted.

In the following example all errors triggered by admins will be ignored:

```js
airbrake.addFilter((notice) => {
  if (notice.params.admin) {
    // Ignore errors from admin sessions.
    return null;
  }
  return notice;
});
```

Filters can be also used to modify notice payload, e.g. to set the environment
and application version:

```js
airbrake.addFilter((notice) => {
  notice.context.environment = 'production';
  notice.context.version = '1.2.3';
  return notice;
});
```

### Filtering keys

With the `keysBlocklist` option, you can specify a list of keys containing
sensitive information that must be filtered out:

```js
const airbrake = new Notifier({
    // ...
    keysBlocklist: [
      'password', // exact match
      /secret/, // regexp match
    ],
});
```

### Node.js request and proxy

To use the [request](https://github.com/request/request) HTTP client, pass
the `request` option which accepts a request wrapper:

```js
const airbrake = new Notifier({
  // ...
  request: request.defaults({'proxy':'http://localproxy.com'})
});
```

### Instrumentation

`@airbrake/node` attempts to automatically instrument various performance
metrics. You can disable that behavior using the `performanceStats` option:

```js
const airbrake = new Notifier({
  // ...
  performanceStats: false
});
```

### Filtering performance data
`addPerformanceFilter` allows for filtering performance data. Return `null` in
the filter to prevent that metric from being reported to Airbrake.

```js
airbrake.addPerformanceFilter((metric) => {
  if (metric.route === '/foo') {
    // Requests to '/foo' will not be reported
    return null;
  }
  return metric;
});
```

[project-idkey]: https://s3.amazonaws.com/airbrake-github-assets/airbrake-js/project-id-key.png
