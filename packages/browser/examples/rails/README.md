### Usage with Ruby on Rails

#### Option 1 - Asset pipeline

Copy the compiled file
[`dist/airbrake.esm.js`](https://github.com/airbrake/airbrake-js/blob/master/packages/browser/dist/airbrake.esm.js)
from this repository to `vendor/assets/javascripts/airbrake.js` in your project.

Then, add the following code to your Sprockets manifest:

```javascript
//= require airbrake

var airbrake = new Airbrake.Notifier({
  projectId: 1,
  projectKey: 'FIXME'
});

airbrake.addFilter(function(notice) {
  notice.context.environment = "<%= Rails.env %>";
  return notice;
});

try {
  throw new Error('hello from airbrake-js');
} catch (err) {
  airbrake.notify(err).then(function(notice) {
    if (notice.id) {
      console.log('notice id:', notice.id);
    } else {
      console.log('notify failed:', notice.error);
    }
  });
}
```

#### Option 2 - Webpacker

Add `@airbrake/broswer` to your application.

```sh
yarn add @airbrake/browser
```

In your main application pack, import `@airbrake/browser` and configure the client.

```js
import { Notifier } from '@airbrake/browser';

const airbrake = new Notifier({
  projectId: 1,
  projectKey: 'FIXME'
});

airbrake.addFilter((notice) => {
  notice.context.environment = process.env.RAILS_ENV;
  return notice;
});

try {
  throw new Error('hello from airbrake-js');
} catch (err) {
  airbrake.notify(err).then((notice) => {
    if (notice.id) {
      console.log('notice id:', notice.id);
    } else {
      console.log('notify failed:', notice.error);
    }
  });
}
```

You should now be able to capture JavaScript exceptions in your Ruby on Rails
application.
