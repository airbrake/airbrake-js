NOTE: This is a work in progress. This document isn't ready for production deployment. 

Airbrake
========

This is the javascript source code for notifying [Airbrake](http://airbrake.io) when your javascript has an exception. 

When an uncaught exception occurs, Airbrake Javascript notifier will POST the relevant data
to the Airbrake server specified in your environment.

Help
----

For help with using Airbrake and this notifier visit [our support site](http://help.airbrake.io).


Install compiled and minified from Airbrake CDN. 
------------------------------------------------

### Basic Setup. 

Include the Javascript notifier in your header. 

    <script src="http://jscdn.airbrake.io/notifier.min.js"></script>

For SSL use this URL. 

    <script src="https://ssljscdn.airbrake.io/notifier.min.js"></script>

After this, setup the notifier. You need an Airbrake API key, sign up for a plan on [Airbrake](http://help.airbrake.io) 

    <script type="text/javascript">
          Airbrake.setKey('<your-api-key>');
	  Airbrake.setHost('api.airbrake.io');
	  Airbrake.setEnvironment('dev');
	  Airbrake.setGuessFunctionName(true);
	  Airbrake.setErrorDefaults({
     	 	url: document.URL,
     		 component: "hello",
    	  	action: "world",
      		});
	</script>

That's it! The header of your HTML document should look like this. 

    <script src="http://cdn.airbrake.io/notifier.min.js"></script>
	<script type="text/javascript">
	  Airbrake.setKey('<your-api-key>');
	  Airbrake.setHost('api.airbrake.io');
	  Airbrake.setEnvironment('dev');
	  Airbrake.setGuessFunctionName(true);
	</script>

The generator creates a file under `config/initializers/airbrake.rb` configuring Airbrake with your API key. This file should be checked into your version control system so that it is deployed to your staging and production environments.

Options. 
------------------------------------------------

### Guess Function name using Stacktrace.js.

We include [stacktrace.js](https://github.com/eriwen/javascript-stacktrace) into the Airbrake notifier. To use it to guess the function name and get the stacktrace add Airbrake.setGuessFunctionName(true); to the settings.  

	Airbrake.setGuessFunctionName(true);

### Manually Send Errors. 

-- Work in Progress --  

		Airbrake.captureException (new Error("hello error world."));
		
We handle the Error (exception) manually with "Airbrake.captureException (err);", we  only get the "message" field of this exception. Field "lineNumber" and "url" will obtained, since not all browsers fill these Error fields. Thus, exception handling so "Airbrake.captureException (err);" and thus "window.onerror = function (message, file, line) {" will be different.

###  Send Parameters. 

-- Work in Progress --  

		
### Track JQuery Errors for JQuery 1.7

-- Work in Progress --  

		Airbrake.setTrackJQ(true)

Development
-----------

Run Ant to compile the source. We don't have a testing framework in place, but we welcome full requests.

Changelog
---------

### v0.1.2-JSON

- New configuration parameter: `outputFormat`. Supported formats are XML and JSON.
- Numerous improvements in logic of XML notification generator: `Util.substituteArr` was implemented; views were separated from logic (`REQUEST_VARIABLE_GROUP_XML`, `REQUEST_VARIABLE_XML`, `BACKTRACE_LINE_XML`).
- Stacktrace.js updated to avoid issues in Opera 11+.
- New tests, more comments, unused code removed.

### v0.1.1

- Public API improvement: getters and setters are generated automatically from inner JSON. e.g. `key` value can be set with `Airbrake.setKey(<key value>);` and the current value is available as `Airbrake.getKey();`. 
- New configuration parameter: `requestType`. Set it to 'GET' (`Airbrake.setRequestType('GET');`) to send <iframe> notification request; 'POST' is for XMLHttpRequest POST.
- Basic Jasmine test are available in `tests/` directory. 

Credits
-------

Airbrake is maintained and funded by [airbrake.io](http://airbrake.io)

Thank you to all [the contributors](https://github.com/airbrake/airbrake-js/contributors).

The names and logos for Airbrake are trademarks of Exceptional Software Inc. 

License
-------
Airbrake is Copyright © 2008-2012 Airbrake. It is free software, and may be redistributed under the terms specified in the MIT-LICENSE file.
