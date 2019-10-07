### Vue.js error handler

You can start reporting errors from your Vue.js app by configuring an
[`errorHandler`](https://vuejs.org/v2/api/#errorHandler) that uses an
`Airbrake.Notifier` initialized with your `projectId` and `projectKey`.

```js
import Airbrake from '@airbrake/browser';

var airbrake = new Airbrake.Browser({
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

For more information on Vue.js error handling, read the [`errorHandler`
documentation](https://vuejs.org/v2/api/#errorHandler).
