Usage with Vue.js
==================

### Vue 2

You can start reporting errors from your Vue 2 app by configuring an
[`errorHandler`](https://vuejs.org/v2/api/#errorHandler) that uses a `Notifier`
initialized with your `projectId` and `projectKey`.

```js
import { Notifier } from '@airbrake/browser';

var airbrake = new Notifier({
  projectId: 1,
  projectKey: 'FIXME'
});

Vue.config.errorHandler = function (err, _vm, info) {
  airbrake.notify({
    error: err,
    params: {info: info}
  });
}
```

### Vue 3

You can start reporting errors from your Vue 3 app by configuring an
[`errorHandler`](https://v3.vuejs.org/api/application-config.html#errorhandler)
that uses a `Notifier` initialized with your `projectId` and `projectKey`.

```js
import { createApp } from "vue";
import App from "./App.vue";
import { Notifier } from '@airbrake/browser';

var airbrake = new Notifier({
  projectId: 1,
  projectKey: 'FIXME'
});

let app = createApp(App);

app.config.errorHandler = function (err, _vm, info) {
  airbrake.notify({
    error: err,
    params: {info: info}
  });
}

app.mount("#app");
```
