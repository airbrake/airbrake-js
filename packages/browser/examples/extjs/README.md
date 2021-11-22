# Usage with Ext JS

### Install the `@airbrake/browser` package

```sh
npm i @airbrake/browser
```

### Make the package available to the ExtJS framework

Inside the `index.js` file located at the root of your project, require the
package and set it as an Ext global property.

```js
// index.js

// To avoid naming conflicts with existing ExtJS properties, prepend your
// package name with x

// https://docs.sencha.com/extjs/7.4.0/guides/using_systems/using_npm/adding_npm_packages.html
Ext.xAirbrake = require('@airbrake/browser');
```

### Instantiate the notifier

Also in `index.js`, create a new notifier instance with your `projectId` and
`projectKey`.

```js
new Ext.xAirbrake.Notifier({
  projectId: 1,
  projectKey: 'FIXME'
});
```

Airbrake will now automatically report any unhandled exceptions. If you want to
send any errors manually, set the notifier instance to a variable and call
`.notify()` where needed.
