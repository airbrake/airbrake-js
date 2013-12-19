# A Sourcemaps-aware processor
# This processor runs the error through an underlying processor,
# then translates the output to file/line pairs as indicated by
# the sourcemaps it obtains

SourceMapConsumer = require('../lib/source-map/source-map-consumer.js').SourceMapConsumer
SourceMapObtainer  = require('../util/source_map_obtainer.coffee')


consumers = {}


class SourceMapProcessor
  constructor: (name, errInfo, cb) ->
    @_name = name
    @_errInfo = errInfo
    @_cb = cb

    @_pendingConsumers = 0
    @_obtainer = new SourceMapObtainer()

  process: ->
    for traceRec in @_errInfo.backtrace
      if not consumers[traceRec.file]
        @_obtainer.obtain traceRec.file, (sourceMap) =>
          @_pendingConsumers--
          if sourceMap
            consumers[traceRec.file] = new SourceMapConsumer(sourceMap)
          if @_pendingConsumers == 0
            @_consumersReady()
        @_pendingConsumers++

    if @_pendingConsumers == 0
      @_consumersReady()

  _consumersReady: ->
    for traceRec in @_errInfo.backtrace
      consumer = consumers[traceRec.file]
      if not consumer
        continue

      pos = consumer.originalPositionFor({
        line: backtrace_entry.line
        column: backtrace_entry.column
      })
      traceRec.file = pos.source
      traceRec.line = pos.line
      traceRec.column = pos.column

    @_cb(@_name + '+source-map', @_errInfo)


module.exports = SourceMapProcessor
