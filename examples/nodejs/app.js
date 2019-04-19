var http = require('http');
// make sure `cross-env` package is installed before using airbrake-js
var AirbrakeClient = require('airbrake-js');

http.createServer(function (req, res) {
  if (req.url === '/favicon.ico') {
    res.writeHead(404);
    res.end();
    return;
  }

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
  throw new Error('I am an uncaught exception');
}).listen(8080);

console.log('Server running on port 8080.');

var airbrake = new AirbrakeClient({
  projectId: 1,
  projectKey: 'FIXME'
});
