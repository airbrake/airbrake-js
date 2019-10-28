function start() {
  var airbrake = new Airbrake.Notifier({
    projectId: 105138,
    projectKey: 'ab34d9c2b6d3639bd3447139342ef181',
  });

  let metric = airbrake.queues.start('something');
  airbrake.notify('app started').then(() => {
    console.log('notify');
    airbrake.queues.notify(metric);
  });

  $(function() {
    $('#send_error').click(function() {
      try {
        history.pushState({ foo: 'bar' }, 'Send error', 'send-error');
      } catch (_) {}

      var val = $('#error_text').val();
      throw new Error(val);
    });
  });

  try {
    throw new Error('hello from airbrake-js');
  } catch (err) {
    airbrake.notify(err).then(function(notice) {
      if (notice.id) {
        console.log('notice id:', notice.id);
      } else {
        console.log('notify failed:', notice.error);
      }
    });
  }
}

throw new Error('uncatched error');
