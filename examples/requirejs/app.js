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
    airbrake.notify(err).then(function(notice) {
      if (notice.id) {
        console.log('notice id:', notice.id);
      } else {
        console.log('notify failed:', notice.error);
      }
    });
  }
});
