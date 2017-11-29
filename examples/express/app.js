var express = require('express');
var AirbrakeClient = require('airbrake-js');
var makeErrorHandler = require('airbrake-js/dist/instrumentation/express');

var app = express();

app.get('/', function hello (req, res) {
  throw new Error('hello from Express');
  res.send('Hello World!');
})

var airbrake = new AirbrakeClient({
  projectId: 1,
  projectKey: 'FIXME',
});
// Error handler middleware should be the last one.
// See http://expressjs.com/en/guide/error-handling.html
app.use(makeErrorHandler(airbrake));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})
