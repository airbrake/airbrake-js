var http = require('http');
var Airbrake = require('@airbrake/node');

http
  .createServer(function(req, res) {
    if (req.url === '/favicon.ico') {
      res.writeHead(404);
      res.end();
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
    throw new Error('I am an uncaught exception');
  })
  .listen(8080);

console.log('Server running on port 8080.');

var airbrake = new Airbrake.Notifier({
  projectId: process.env.AIRBRAKE_PROJECT_ID,
  projectKey: process.env.AIRBRAKE_PROJECT_KEY,
});
