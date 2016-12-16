# Usage with React Native

The default airbrake-js reporter is `document` which is not available in React
Native. You should specify reporter: xhr as follows:

```js
const config = {
  projectId: 1,
  projectKey: 'abc',
  reporter: 'xhr'
};
this.airbrake = new airbrakeJs(config);
```
