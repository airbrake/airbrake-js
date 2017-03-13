function start() {
  var airbrake = new airbrakeJs.Client({
    projectId: 1,
    projectKey: 'FIXME'
  });

  try {
    throw new Error('hello from Bower+Wiredep');
  } catch (err) {
    promise = airbrake.notify(err);
    promise.then(function(notice) {
      console.log('notice id:', notice.id);
    }, function(err) {
      console.log('airbrake failed:', err);
    });
  }
}

start();
