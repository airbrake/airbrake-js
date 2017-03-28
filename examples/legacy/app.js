function start() {
  var airbrake = new airbrakeJs.Client({
    projectId: 1,
    projectKey: 'FIXME'
  });

  airbrake.notify('app started');

  $(function() {
    $('#send_error').click(function() {
      try {
        history.pushState({'foo': 'bar'}, 'Send error', 'send-error');
      } catch (_) {}

      var val = $('#error_text').val();
      throw new Error(val);
    });
  });

  try {
    throw new Error('hello from airbrake-js');
  } catch (err) {
    promise = airbrake.notify(err);
    promise.then(function(notice) {
      console.log('notice id:', notice.id);
    }, function(err) {
      console.log('airbrake failed:', err);
    });
  }
}

throw new Error('uncatched error');
