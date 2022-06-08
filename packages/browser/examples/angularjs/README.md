# Usage with AngularJS

Integration with AngularJS is as simple as adding an [$exceptionHandler][1]:

```js
// app.js
const module = angular.module('app', []);

module.factory('$exceptionHandler', function ($log) {
  const airbrake = new Airbrake.Notifier({
    projectId: 1, // Airbrake project id
    projectKey: 'FIXME', // Airbrake project API key
  });

  airbrake.addFilter(function (notice) {
    notice.context.environment = 'production';
    return notice;
  });

  return function (exception, cause) {
    $log.error(exception);
    airbrake.notify({ error: exception, params: { angular_cause: cause } });
  };
});

module.controller('HelloWorldCtrl', function ($scope) {
  throw new Error('Uh oh, something happened');

  $scope.message = 'Hello World';
});
```

```html
<!-- index.html -->
<!DOCTYPE html>
<html ng-app="app">
  <head>
    <meta charset="utf 8" />
    <title>Hello World</title>
  </head>
  <body>
    <h1 ng-controller="HelloWorldCtrl">{{message}}</h1>
    <script src="https://code.angularjs.org/1.8.2/angular.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@airbrake/browser"></script>
    <script src="app.js"></script>
  </body>
</html>
```

[1]: https://docs.angularjs.org/api/ng/service/$exceptionHandler
