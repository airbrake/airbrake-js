const express = require('express');
const AirbrakeClient = require('airbrake');
const airbrakeExpress = require('airbrake/dist/instrumentation/express');

const app = express();

const airbrake = new AirbrakeClient({
  projectId: process.env.AIRBRAKE_PROJECT_ID,
  projectKey: process.env.AIRBRAKE_PROJECT_KEY,
});

// This middleware should be used before any routes are defined.
app.use(airbrakeExpress.makeMiddleware(airbrake));

app.get('/', function hello(req, res) {
  throw new Error('hello from Express');
  res.send('Hello World!');
});

app.get('/hello/:name', function hello(req, res) {
  res.send(`Hello ${req.params.name}`);
});

// Error handler middleware should be the last one.
// See http://expressjs.com/en/guide/error-handling.html
app.use(airbrakeExpress.makeErrorHandler(airbrake));

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
