require.config({
  paths: {
    airbrakeJs: 'node_modules/airbrake-js/dist'
  }
});

require(['airbrakeJs/client'], function (AirbrakeClient) {
  var airbrake = new AirbrakeClient({
    projectId: 1,
    projectKey: 'FIXME'
  });

  try {
    throw new Error('hello from Require.js');
  } catch (err) {
    promise = airbrake.notify(err);
    promise.then(function(notice) {
      console.log('notice id:', notice.id);
    }, function(err) {
      console.log('airbrake failed:', err);
    });
  }
});
