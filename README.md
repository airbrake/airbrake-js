# Airbrake-JS [![Build Status](https://circleci.com/gh/airbrake/airbrake-js.png?circle-token=3c561e089366ed8e0c9ec396a69f9665c1331581)](https://circleci.com/gh/airbrake/airbrake-js)

This is the JavaScript notifier for capturing errors in web browsers and reporting them to [Airbrake](http://airbrake.io).

<img src="http://f.cl.ly/items/443E2J1D2W3x1E1u3j1u/JS-airbrakeman.jpg" width=800px>

## Installation

Using npm:

```sh
npm install airbrake-js
```

or using Bower:

```sh
bower install airbrake-js-client
```

## Setup

The notifier is built using a
[standalone browserify build](http://www.forbeslindesay.co.uk/post/46324645400/standalone-browserify-builds)
and can be used with:
- [RequireJS](examples/requirejs/app.js).
- [Global/Window](examples/legacy/app.js).

We include the full source code with the package, so you can use
[Browserify](examples/browserify/app.js) too.

If you prefer not to host the library yourself,
[airbrake-js is available on the excellent cdnjs CDN](https://cdnjs.com/libraries/airbrake-js).

## Basic Usage

First you need to initialize notifier with project id and API key taken from [Airbrake.io](https://airbrake.io):

```js
var airbrake = new airbrakeJs.Client({projectId: 1, projectKey: 'abc'});
```

The simplest method is to report errors directly:

```js
try {
  // This will throw if the document has no head tag
  document.head.insertBefore(document.createElement("style"));
} catch(err) {
  airbrake.notify(err);
  throw err;
}
```

Alternatively you can wrap any code which may throw errors using the client's `wrap` method:

```js
var startApp = function() {
  // This will throw if the document has no head tag.
  document.head.insertBefore(document.createElement("style"));
}
startApp = airbrake.wrap(startApp);

// Any exceptions thrown in startApp will be reported to Airbrake.
startApp();
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
    context:     { component: 'bootstrap' }
    environment: { env1: 'value' },
    params:      { param1: 'value' },
    session:     { session1: 'value' },
  });
  throw err;
}
```

### Filtering errors

There may be some errors thrown in your application that you're not interested in sending to Airbrake, such as errors thrown by 3rd-party libraries, or by browser extensions run by your users.

The Airbrake notifier makes it simple to ignore this chaff while still processing legitimate errors. Add filters to the notifier by providing filter functions to `addFilter`.

`addFilter` accepts the entire [error notice](https://airbrake.io/docs/#create-notice-v3) to be sent to Airbrake, and provides access to the `context`, `environment`, `params`, and `session` values submitted with the notice, as well as the single-element `errors` array with its `backtrace` element and associated backtrace lines.

The return value of the filter function determines whether or not the error notice will be submitted.
  * If null value is returned, the notice is ignored.
  * Otherwise returned notice will be submitted.

An error notice must pass all provided filters to be submitted.

In the following example all errors triggered by admins will be ignored:

```js
airbrake.addFilter(function(notice) {
  if (notice.sessions.admin) {
    // Ignore errors from admin sessions.
    return null;
  }
  return notice;
});
```

Filters can be also used to modify notice payload, e.g. to set environment and application version:

```js
airbrake.addFilter(function(notice) {
  notice.context.environment = 'production';
  notice.context.version = '1.2.3';
  return notice;
});
```

### Source map

In order to enable source map support you have to specify path to the source map file according to the [source map specification](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.lmz475t4mvbx). For example, airbrake.min.js has following line:

```js
//# sourceMappingURL=airbrake.min.map
```

*Please note* that Airbrake backend downloads source map file in order to process backtrace. This means that source map should be publicly accessible via HTTP. So, for example, don't expect source map support to work on your local webserver running on `localhost`.

### Custom reporters

If you're interested in inspecting the information reported to Airbrake in your own code, you can register your own error reporter. Note that reporters added this way may be executed out-of-order.

In this example, reported errors are also logged to the console.

```html
<script>
  airbrake.addReporter(function(notice) {
    console.log(notice);
  });
</script>
```

## Integration

### window.onerror

By default notifier setups [window.onerror](https://developer.mozilla.org/ru/docs/Web/API/GlobalEventHandlers/onerror) handler if onerror handler is not already setup. You can manually setup it using following code:

```js
var airbrake = new airbrakeJs.Client(...);
window.onerror = airbrake.onerror;
```

### Angular

Integration with Angular is as simple as adding [$exceptionHandler](https://docs.angularjs.org/api/ng/service/$exceptionHandler):

```js
mod.factory('$exceptionHandler', function ($log, config) {
  airbrake = new airbrakeJs.Client({
    projectId: config.airbrake.projectId,
    projectKey: config.airbrake.key
  });
  airbrake.addFilter(function (notice) {
    notice.context.environment = config.envName;
    return notice;
  });

  return function (exception, cause) {
    $log.error(exception);
    airbrake.notify({error: exception, params: {angular_cause: cause}});
  };
});
```

## Script error

See https://developer.mozilla.org/en/docs/Web/API/GlobalEventHandlers/onerror#Notes.

## Developing

Install dependencies:

```sh
npm install
```

Run unit tests:

```sh
grunt test
```

Run integration tests:

```sh
grunt karma
```

## Credits

Airbrake is maintained and funded by [airbrake.io](http://airbrake.io)

Thank you to all [the contributors](https://github.com/airbrake/airbrake-js/contributors).

The names and logos for Airbrake are trademarks of Airbrake Technologies Inc.

# License

Airbrake is Copyright © 2008-2015 Airbrake Technologies Inc. It is free software, and may be redistributed under the terms specified in the MIT-LICENSE file.
