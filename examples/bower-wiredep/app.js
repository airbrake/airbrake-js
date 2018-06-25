function start() {
  var airbrake = new airbrakeJs.Client({
    projectId: 1,
    projectKey: 'FIXME'
  });

  try {
    throw new Error('hello from Bower+Wiredep');
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

start();
