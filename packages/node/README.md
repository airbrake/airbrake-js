# Airbrake for Node.js

[![Build Status](https://travis-ci.org/airbrake/airbrake-js.svg?branch=master)](https://travis-ci.org/airbrake/airbrake-js)

This is the JavaScript notifier for capturing errors in Node.js and reporting them to [Airbrake](http://airbrake.io). For web browsers there is a [separate package](https://github.com/airbrake/airbrake-js/tree/master/packages/airbrake-js).

<img src="http://f.cl.ly/items/443E2J1D2W3x1E1u3j1u/JS-airbrakeman.jpg" width=800px>

## Installation

airbrake can be installed using yarn:


```sh
yarn add airbrake
```

or using npm:

```sh
npm install airbrake
```

Example configurations can be found in [examples](examples), including:

* [Express](examples/express)
* [Node.js](examples/nodejs)

### Node.js request and proxy

In order to configure [request](https://github.com/request/request) HTTP client you can pass `request` option which accepts request wrapper:

```js
var airbrake = new AirbrakeClient({
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
