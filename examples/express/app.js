var express = require('express');
var app = express();
var AirbrakeClient = require('airbrake-js');

var airbrake = new AirbrakeClient({
  projectId: 1,
  projectKey: 'FIXME'
});

app.get('/', function (req, res) {
  throw new Error('hello from Express');
  res.send('Hello World!');
})

app.use(function (err, req, res, next) {
  airbrake.notify(err);
  next(err);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
})
