var airbrake = new Airbrake.Notifier({
  projectId: 1,
  projectKey: 'FIXME',
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
  throw new Error('Hello from Airbrake!');
} catch (err) {
  airbrake.notify(err).then(function(notice) {
    if (notice.id) {
      console.log('notice id:', notice.id);
    } else {
      console.log('notify failed:', notice.error);
    }
  });
}

throw new Error('uncaught error');
