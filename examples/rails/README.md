# Usage with Ruby on Rails

In order to include airbrake-js into your Ruby on Rails application,
place this in your `Gemfile`:

```ruby
# somewhere in Gemfile
source 'https://rails-assets.org' do
  gem 'rails-assets-airbrake-js-client'
end
```

And then place the following code into your `application.js`:

```javascript
//= require airbrake-js-client

var airbrake = new airbrakeJs.Client({projectId: 1, projectKey: 'FIXME'});
airbrake.addFilter(function(notice) {
  notice.context.environment = "<%= Rails.env %>";
  return notice;
});

try {
  throw new Error('hello from airbrake-js');
} catch (err) {
  var promise = airbrake.notify(err);
  promise.then(function(notice) {
    console.log("notice id", notice.id);
  });
}
```

You should now be able to capture JavaScript exceptions in your Ruby on Rails
application.
