Client = require('./client.coffee')
processor = require('./processors/stack.coffee')
reporter = require('./reporters/hybrid.coffee')


client = new Client processor, reporter

# Read configuration from DOM.
require("./util/slurp_config_from_dom.coffee")(client)

shim = global.Airbrake
if shim?
  if shim.wrap?
    client.wrap = shim.wrap

  # Consume any errors already pushed to the shim.
  for err in shim
    client.push(err)


global.Airbrake = client
