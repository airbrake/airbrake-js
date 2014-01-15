function throwError(msg) {
  throw new Error(msg);
}

$(function() {
  $("#try_catch_btn").click(function() {
    try {
      throwError("try and catch exception");
    } catch (err) {
      Airbrake.push({error: err, params: {arguments: arguments}});
    }
  });

  $("#try_catch_string_btn").click(function() {
    try {
      throw "try and catch string";
    } catch (err) {
      Airbrake.push({error: err, params: {arguments: arguments}});
    }
  });

  $("#jquery_event_btn").click(function() {
    throwError("unhandled exception in the event handler");
  });

  $("#jquery_promise_btn").click(function() {
    var deferred = jQuery.Deferred();
    deferred.always(function() {
      throwError("unhandled exception in the promise handler");
    });
    deferred.resolve();
  });

  throwError("unhandled exception when DOM is ready");
});

throwError("unhandled exception before DOM is ready");
