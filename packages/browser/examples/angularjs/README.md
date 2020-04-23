# Usage with AngularJS

Integration with AngularJS is as simple as adding an
[$exceptionHandler](https://docs.angularjs.org/api/ng/service/$exceptionHandler):

```js
angular
  .module('app')
  .factory('$exceptionHandler', function ($log) {
    var airbrake = new Notifier({
      projectId: 1,       // Airbrake project id
      projectKey: 'FIXME' // Airbrake project API key
    });

    airbrake.addFilter(function (notice) {
      notice.context.environment = 'production';
      return notice;
    });

    return function (exception, cause) {
      $log.error(exception);
      airbrake.notify({error: exception, params: {angular_cause: cause}});
    };
  });
```
