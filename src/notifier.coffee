require('./util/compat')
Client = require('./client')


client = new Client()
client.consoleReporter = require('./reporters/console')

shim = global.Airbrake
global.Airbrake = client

# Read configuration from DOM.
require('./util/slurp_config_from_dom')(client)

if shim?
  if shim.wrap?
    client.wrap = shim.wrap

  if shim.onload?
    shim.onload(client)

  # Consume any errors already pushed to the shim.
  for err in shim
    client.push(err)


module.exports = client
