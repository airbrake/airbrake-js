### Usage with Ruby on Rails

#### Option 1 - Asset pipeline
Copy the compiled file
[`dist/client.js`](https://github.com/airbrake/airbrake-js/blob/master/dist/client.js)
from this repository to `vendor/assets/javascripts/airbrake.js` in your project.

Then, add the following code to your Sprockets manifest:

```javascript
//= require airbrake

var airbrake = new airbrakeJs.Client({
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
Add `airbrake-js` and `cross-fetch` to your application.

```sh
yarn add airbrake-js cross-fetch
```

In your main application pack, import `airbrake-js` and configure the client.

```js
import AirbrakeClient from 'airbrake-js';

const airbrake = new AirbrakeClient({
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
