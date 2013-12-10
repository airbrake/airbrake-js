Client = require './client'
preprocessor = require './processors/stack'
SourceMapProcessor = require './processors/source_map'
reporter = require './reporters/hybrid'
WindowError = require './util/window_error'


processor = (errInfo, cb) ->
  preprocessor errInfo, (name, errInfo) ->
    p = new SourceMapProcessor(name, errInfo, cb)
    p.process()


client = new Client processor, reporter
client.WindowError = WindowError

# Read configuration from DOM.
require("./util/slurp_config_from_dom")(client)

shim = global.Airbrake
if shim?
  if shim.wrap?
    client.wrap = shim.wrap

  # Consume any errors already pushed to the shim.
  for err in shim
    client.push(err)


global.Airbrake = client
