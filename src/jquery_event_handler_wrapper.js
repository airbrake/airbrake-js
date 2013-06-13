function jQueryEventHandlerWrapper(reportError) {
  var originalOnFn;

  this.on = function() {
    // Start wrapping jQuery event handlers

    // TODO: I think we can just eliminate this and early-return
    if ("undefined" === typeof global.jQuery) {
      throw new Error('jQuery unavailable');
    }

    originalOnFn = originalOnFn || jQuery.fn.on;

    jQuery.fn.on = function() {
      var args = Array.prototype.slice.call(arguments),
          handler, newHandler;

      // Pop the original event handler off
      handler = args.pop();

      // Wrap the original handler in a try/catch+report
      newHandler = function() {
        try {
          return handler.apply(this, arguments);
        } catch (err) {
          reportError(err);
        }
      };

      // Replace the original handler with the wrapped one
      args.push(newHandler);

      // Continue invoking original `on` with modified arguments
      return originalOnFn.apply(this, args);
    };
  };

  this.off = function() {
    if (!originalOnFn) { return; }

    // Stop wrapping jQuery event handlers
    jQuery.fn.on = originalOnFn;
  };
}

module.exports = jQueryEventHandlerWrapper;
