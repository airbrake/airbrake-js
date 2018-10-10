Please note that this file only lists backwards incompatible changes. For full list of changes please check https://github.com/airbrake/airbrake-js/commits/master

### Unreleased v1.6.0

- `jsonp` and `xhr` reporters are removed, because `fetch` is supported in modern browsers with help of isomorphic-fetch.

### v1.5.0

- request lib is replaced with isomorphic-fetch on Node.js to decrease bundle size. You need to `npm install isomorphic-fetch` or re-configure notifier if you want to continue using request:

```js
var airbrake = new AirbrakeClient({
  ...
  request: request
});
```

### v1.2.0

- airbrake-js no longer rejects promises returned by `notify` to not trigger unhandled rejection warnings. Instead error is stored in `notice.error` and promise is resolved. For example:

```js
airbrake.notify(err).then(function(notice) {
  if (notice.id) {
    console.log('notice id:', notice.id);
  } else {
    console.log('notify failed:', notice.error);
  }
});
```
