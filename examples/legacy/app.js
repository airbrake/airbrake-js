function start() {
  var airbrake = new airbrakeJs.Client({projectId: 1, projectKey: 'FIXME'});
  if (window.jQuery) {
    airbrakeJs.instrumentation.jquery(airbrake, jQuery);
  }

  $('#send_error').click(function() {
    throw new Error($('#error_text').val());
  });

  try {
    throw new Error('hello from airbrake-js');
  } catch (err) {
    promise = airbrake.notify(err);
    promise.then(function(notice) {
      console.log("notice id", notice.id);
    });
  }
}
