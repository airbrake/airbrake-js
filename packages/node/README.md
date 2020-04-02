# Airbrake for Node.js

[![Build Status](https://github.com/airbrake/airbrake-js/workflows/Test/badge.svg?branch=master)](https://github.com/airbrake/airbrake-js/actions?query=branch%3Amaster)

This is the JavaScript notifier for capturing errors in Node.js and reporting them to [Airbrake](http://airbrake.io). For web browsers there is a [separate package](https://github.com/airbrake/airbrake-js/tree/master/packages/browser).

<img src="http://f.cl.ly/items/443E2J1D2W3x1E1u3j1u/JS-airbrakeman.jpg" width=800px>

## Installation

airbrake can be installed using yarn:


```sh
yarn add @airbrake/node
```

or using npm:

```sh
npm install @airbrake/node
```

Example configurations can be found in [examples](examples), including:

* [Express](examples/express)
* [Node.js](examples/nodejs)

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

### Node.js request and proxy

In order to use [request](https://github.com/request/request) HTTP client you can pass `request` option which accepts request wrapper:

```js
const airbrake = new Notifier({
  ...
  request: request.defaults({'proxy':'http://localproxy.com'})
});
```

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
