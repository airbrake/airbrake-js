# Airbrake-JS

This is the JavaScript notifier for capturing errors in web browsers and reporting them to [Airbrake](http://airbrake.io).

<img src="http://f.cl.ly/items/443E2J1D2W3x1E1u3j1u/JS-airbrakeman.jpg" width=800px>

## Setup

Include the following Javascript snippet in your header.

    <script data-airbrake-project-id="1234"
            data-airbrake-project-key="abcd"
            data-airbrake-project-environment-name="production">

      (function(src) {

      window.Airbrake = [];
      window.Airbrake.wrap = function(fn) {
        return function() {
          try {
            return fn.apply(this, arguments);
          } catch (er) {
            Airbrake.push({ error: er });
          }
        };
      };

      function get() {
        var script = document.createElement('script'),
            sibling = document.getElementsByTagName('script')[0];

        script.src = src;
        sibling.parentNode.insertBefore(script, sibling);
      }

      if (window.addEventListener) {
        window.addEventListener('load', get, false);
      } else {
        window.attachEvent('onload', get);
      }

      }(
        'https://ssljscdn.airbrake.io/airbrake-js-tracekit-sourcemap.min.js'
      ));
    </script>


This snippet asynchronously downloads the Airbrake notifier and configures it to report errors to your project endpoint.
It also provides a shim client capable of running code with error-capturing enabled, and gathering those errors up until the full notifier is downloaded and bootstrapped.

## Basic Usage

The simplest method for capturing errors is to wrap any code which may throw errors using the client's `wrap` method.

    var wrapped = Airbrake.wrap(function() {
      // This will throw if the document has no head tag
      document.head.insertBefore(document.createElement("style"));
    });

    wrapped();

Alternatively, you can report errors directly.

    try {
      // This will throw if the document has no head tag
      document.head.insertBefore(document.createElement("style"));
    } catch(er) {

      // `push` will report the error, and then rethrow it
      // after it has been reported.
      // It will not be rethrown in this catch block,
      // but when it is rethrown it will carry its original backtrace.
      Airbrake.push({ error: er });
    }

If you want to suppress rethrowing of reported errors by the notifier, include `catch: true` in the data payload.

If you're working with [jQuery Deferreds](http://api.jquery.com/category/deferred-object/) it makes sense to hook into the `fail` handler. This example reports errors thrown from within [`$.ajax`](http://api.jquery.com/jQuery.ajax/).

    $.ajax("/operation").done(function(data) {
      console.log("Success, got data: %o", data);
    }).fail(function(jqXhr, textStatus, er) {
      if (er)
        Airbrake.push({
          error: er
        });
    });

## Advanced Usage

The notifier provides a few pieces of functionality to help reduce duplication when you report errors. In order to access this functionality, the full notifier needs to be loaded, not just the shim implelementation provided in the embed snippet.

### Notifier `onload`

Fortunately, it's easy to register code to be run when the notifier loads. In the embed snippet, simply add a `data-airbrake-onload` attribute and specify the name of the function to be executed when the notifier is ready.

    <script data-airbrake-onload="initAirbrake">
      function initAirbrake() {
        Airbrake.addSession({ split_test: 10 });
      }
    </script>

### Default Annotations

It's possible to annotate error reports with all sorts of useful information. Below, the various top-level interface methods are listed, along with their effects.

* `Airbrake.setEnvironmentName(string)` Sets the environment name displayed alongside an error report.
* `Airbrake.addContext(object)` Merges context information reported alongside all errors.
* `Airbrake.addEnvironment(object)` Merges environment information about the application's environment.
* `Airbrake.addParams(object)` Merges params information reported alongside all errors.
* `Airbrake.addSession(object)` Merges session information reported alongside all errors.

Additionally, much of this information can be added to captured errors at the time they're captured by supplying it in the object being reported.

    try {
      // This will throw if the document has no head tag
      document.head.insertBefore(document.createElement("style"));
    } catch(er) {
      Airbrake.push({
        error: er,
        context: { component: 'style', userId: currentUser.id, userName: currentUser.name },
        environment: { navigator_vendor: window.navigator.vendor },
        params:  { search: document.location.search },
        session: { sessionid: sessionid }
      });
      throw er;
    }

### Custom reporters

If you're interested in getting access to the information reported to Airbrake in your own code, you can register your
own error reporter. Note that reporters added this way may be executed out-of-order.

In this example, reported errors are also logged to the console.

    <script>
      Airbrake.addReporter(function(data, options) {
        console.log(data);
      });
    </script>

## Help

For help with using Airbrake and this notifier visit [our support site](http://help.airbrake.io).

## Credits

Airbrake is maintained and funded by [airbrake.io](http://airbrake.io)

Thank you to all [the contributors](https://github.com/airbrake/airbrake-js/contributors).

The names and logos for Airbrake are trademarks of Rackspace Hosting Inc.

# License

Airbrake is Copyright © 2008-2013 Rackspace Hosting Inc. It is free software, and may be redistributed under the terms specified in the MIT-LICENSE file.
