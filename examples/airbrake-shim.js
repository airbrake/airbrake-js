(function(window) {

// Airbrake shim that stores exceptions until Airbrake notifier is loaded.
window.Airbrake = [];

// Wraps passed function and returns new function that catches and
// reports unhandled exceptions.
Airbrake.wrap = function(fn) {
  var airbrakeWrapper = function() {
    try {
      return fn.apply(this, arguments);
    } catch (exc) {
      args = Array.prototype.slice.call(arguments);
      Airbrake.push({error: exc, params: {arguments: args}});
    }
  }
  if (fn.guid) {
    airbrakeWrapper.guid = fn.guid;
  }
  return airbrakeWrapper;
}

// Registers console reporter when notifier is ready.
Airbrake.onload = function() {
  Airbrake.addReporter(Airbrake.consoleReporter);
}

// Reports unhandled exceptions.
window.onerror = function(message, file, line, column, error) {
  if (message === 'Script error.') {
    // Ignore.
    return;
  }

  if (error) {
    Airbrake.push({error: error});
  } else {
    Airbrake.push({error: {
      message: message,
      fileName: file,
      lineNumber: line,
      columnNumber: column || 0
    }});
  }
}

var loadAirbrakeNotifier = function() {
  var script = document.createElement('script'),
      sibling = document.getElementsByTagName('script')[0];
  script.src = 'https://ssljscdn.airbrake.io/0.3/airbrake.min.js';
  script.async = true;
  sibling.parentNode.insertBefore(script, sibling);
}

var setupJQ = function() {
  var jqEventAdd = jQuery.event.add;
  jQuery.event.add = function(elem, types, handler, data, selector) {
    if (handler.handler) {
      if (!handler.handler.guid) {
        handler.handler.guid = jQuery.guid++;
      }
      handler.handler = Airbrake.wrap(handler.handler);
    } else {
      if (!handler.guid) {
        handler.guid = jQuery.guid++;
      }
      handler = Airbrake.wrap(handler);
    }
    return jqEventAdd(elem, types, handler, data, selector);
  }

  // Reports exceptions thrown in jQuery callbacks.
  var jqCallbacks = jQuery.Callbacks;
  jQuery.Callbacks = function(options) {
    var cb = jqCallbacks(options),
        cbAdd = cb.add;
    cb.add = function() {
      var fns = arguments;
      jQuery.each(fns, function(i, fn) {
        if (jQuery.isFunction(fn)) {
          fns[i] = Airbrake.wrap(fn);
        }
      });
      return cbAdd.apply(this, fns);
    }
    return cb;
  }

  // Reports exceptions thrown in jQuery ready callbacks.
  var jqReady = jQuery.fn.ready;
  jQuery.fn.ready = function(fn) {
    return jqReady(Airbrake.wrap(fn));
  }
}

// Asynchronously loads Airbrake notifier.
if (window.addEventListener) {
  window.addEventListener('load', loadAirbrakeNotifier, false);
} else {
  window.attachEvent('onload', loadAirbrakeNotifier);
}

// Reports exceptions thrown in jQuery event handlers.
if (window.jQuery) {
  setupJQ();
} else {
  console.warn('airbrake: jQuery not found; skipping jQuery instrumentation.');
}

})(window);
