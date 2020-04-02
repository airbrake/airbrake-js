const http = require('http');
const Airbrake = require('@airbrake/node');

new Airbrake.Notifier({
  projectId: process.env.AIRBRAKE_PROJECT_ID,
  projectKey: process.env.AIRBRAKE_PROJECT_KEY,
});

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((_req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
  throw new Error('I am an uncaught exception');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
