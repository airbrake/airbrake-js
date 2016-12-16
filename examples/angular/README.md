# Usage with Angular

Integration with Angular is as simple as adding an
[$exceptionHandler](https://docs.angularjs.org/api/ng/service/$exceptionHandler):

```js
mod.factory('$exceptionHandler', function ($log, config) {
  var airbrake = new airbrakeJs.Client({
    projectId: config.airbrake.projectId,
    projectKey: config.airbrake.key
  });
  airbrake.addFilter(function (notice) {
    notice.context.environment = config.envName;
    return notice;
  });

  return function (exception, cause) {
    $log.error(exception);
    airbrake.notify({error: exception, params: {angular_cause: cause}});
  };
});
```
