const express = require('express');
const pg = require('pg');

const Airbrake = require('@airbrake/node');
const airbrakeExpress = require('@airbrake/node/dist/instrumentation/express');
const airbrakePG = require('@airbrake/node/dist/instrumentation/pg');

async function main() {
  const airbrake = new Airbrake.Notifier({
    projectId: process.env.AIRBRAKE_PROJECT_ID,
    projectKey: process.env.AIRBRAKE_PROJECT_KEY,
  });

  console.log(pg.Client.prototype.query);

  const client = new pg.Client();
  await client.connect();

  const app = express();

  // This middleware should be added before any routes are defined.
  app.use(airbrakeExpress.makeMiddleware(airbrake));

  app.get('/', async function home(req, res) {
    const result = await client.query('SELECT $1::text as message', [
      'Hello world!',
    ]);
    console.log(result.rows[0].message);

    res.send('Hello World!');
  });

  app.get('/hello/:name', function hello(req, res) {
    throw new Error('hello from Express');
    res.send(`Hello ${req.params.name}`);
  });

  // Error handler middleware should be the last one.
  // See http://expressjs.com/en/guide/error-handling.html
  app.use(airbrakeExpress.makeErrorHandler(airbrake));

  app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
  });
}

main();
