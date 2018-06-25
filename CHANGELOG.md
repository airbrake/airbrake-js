# v1.2.0

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
