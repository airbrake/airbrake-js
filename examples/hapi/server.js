'use strict';

const Hapi = require('hapi');
const AirbrakeClient = require('airbrake-js');
const makeErrorHandler = require('airbrake-js/dist/instrumentation/hapi');


// Create Airbrake client
const airbrake = new AirbrakeClient({
  projectId: 1,
  projectKey: 'FIXME'
});

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: 'localhost',
  port: 8000
});

// Add the route
server.route({
  method: 'GET',
  path: '/hello',
  handler: function hello(request, reply) {
    throw new Error('hello from hapi');
    return reply('hello world');
  }
});

// Register Airbrake error handler
server.register({
  register: makeErrorHandler(airbrake),
}, (err) => {
  if (err) {
    throw err;
  }
});

// Start the server
server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
