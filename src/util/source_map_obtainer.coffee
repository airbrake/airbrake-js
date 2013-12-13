decodeBase64 = require('./base64_decode').decode;

sourceMapUrlRe = /\/\/(?:@|#) sourceMappingURL=(.+)$/
dataUriRe = /data:application\/json;base64,(.*)/


xhr = (url, cb) ->
  req = new global.XMLHttpRequest()
  req.open('GET', url, true)
  try
    req.send()
  catch err
    cb('')
  finally
    req.onreadystatechange = ->
      cb(req.responseText)


class SourceMapObtainer
  obtain: (url, cb) ->
    xhr url, (body) =>
      url = @_sourceMapUrl(body)
      if url
        sourceMap = @_dataUri(url)
        if sourceMap
          cb(sourceMap)
        else
          xhr url, (sourceMap) -> cb(sourceMap)
      else
        cb()

  # Extract the source maps url (if any) from a corpus of text.
  _sourceMapUrl: (body) ->
    m = body.match(sourceMapUrlRe)
    if m
      return m[1]

  # Convert a base64 data-uri to a (hopefully) JSON string.
  _dataUri: (url) ->
    m = url.match(dataUriRe)
    if m
      return decodeBase64(m[1])



module.exports = SourceMapObtainer
