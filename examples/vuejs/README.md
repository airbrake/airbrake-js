# Vue.js error handler

You need to define error handler:

```js
import AirbrakeClient from 'airbrake-js';

var airbrake = new AirbrakeClient({
  projectId: 1,
  projectKey: 'FIXME'
});

Vue.config.errorHandler = function (err, vm, info) {
  airbrake.notify({
    error: err,
    params: {info: info}
  });
}
```

Read [errorHandler documentation](https://vuejs.org/v2/api/#errorHandler) for more details.
