var express = require('express');
var app = express();
var AirbrakeClient = require('airbrake-js');
var makeErrorHandler = require('airbrake-js/dist/instrumentation/express');

var airbrake = new AirbrakeClient({
  projectId: 1,
  projectKey: 'FIXME'
});

app.get('/', function hello (req, res) {
  throw new Error('hello from Express');
  res.send('Hello World!');
})

app.use(makeErrorHandler(airbrake));

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})
