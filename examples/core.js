function throwError(msg) {
  throw new Error(msg);
}

$(function() {
  $("#try_catch_btn").click(function() {
    try {
      throwError("catched exception");
    } catch (err) {
      Airbrake.push({error: err, params: {arguments: arguments}});
    }
  });

  $("#jquery_event_btn").click(function() {
    throwError("uncatched exception in event handler");
  });

  $("#jquery_promise_btn").click(function() {
    var deferred = jQuery.Deferred();
    deferred.always(function() {
      throwError("uncatched exception in promise handler");
    });
    deferred.resolve();
  });
});

throwError("uncatched exception before DOM is ready");
