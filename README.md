# Airbrake-JS

This is the JavaScript notifier for capturing errors in web browsers and reporting them to [Airbrake](http://airbrake.io).

<img src="http://f.cl.ly/items/443E2J1D2W3x1E1u3j1u/JS-airbrakeman.jpg" width=800px>

## Setup

Include the following Javascript snippet in your header.

    <script>
      window.Airbrake = [];
      window.Airbrake.try = function(fn, as) { try { return fn.call(as); } catch(er) { window.Airbrake.push(er); } };
      window.Airbrake.wrap = function(fn, as) { return function() { return Airbrake.try(fn, as); }; }
    </script>
    <script defer src="https://ssljscdn.airbrake.io/airbrake-js-tracekit-sourcemap.min.js"
            data-airbrake-project-id="1234"
            data-airbrake-project-key="abcd"
            data-airbrake-project-environment-name="production"></script>


This snippet asynchronously downloads the Airbrake notifier and configures it to report errors to your project endpoint.
It also provides a shim client capable of running code with error-capturing enabled, and gathering those errors up until the full notifier is downloaded and bootstrapped.

## Basic Usage

The simplest method for capturing errors is to run any code which may throw errors from within the client's `try` method.

    Airbrake.try(function() {
      // This will throw if the document has no head tag
      document.head.insertBefore(document.createElement("style"));
    });

Alternatively, you can report errors directly.

    try {
      // This will throw if the document has no head tag
      document.head.insertBefore(document.createElement("style"));
    } catch(er) {
      Airbrake.push({
        error: er
      });
    }

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
    }

## Global Error Handling

## Help

For help with using Airbrake and this notifier visit [our support site](http://help.airbrake.io).

## Credits

Airbrake is maintained and funded by [airbrake.io](http://airbrake.io)

Thank you to all [the contributors](https://github.com/airbrake/airbrake-js/contributors).

The names and logos for Airbrake are trademarks of Rackspace Hosting Inc.

# License

Airbrake is Copyright © 2008-2013 Rackspace Hosting Inc. It is free software, and may be redistributed under the terms specified in the MIT-LICENSE file.
