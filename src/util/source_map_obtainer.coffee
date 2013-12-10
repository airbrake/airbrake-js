decodeBase64 = require('./base64_decode').decode;

sourceMapUrlRe = /\/\/(?:@|#) sourceMappingURL=(.+)/
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
      smUrl = @_sourceMapUrl(body)

      if smUrl == ''
        smUrl = url.replace(/\.[a-z]+$/, '.map')
      else
        sourceMap = @_dataUri(smUrl)
        if sourceMap != ''
          cb(sourceMap)
          return

      xhr smUrl, (sourceMap) ->
        cb(sourceMap)

  # Extract the source maps url (if any) from a corpus of text.
  _sourceMapUrl: (body) ->
    m = body.match(sourceMapUrlRe)
    return m[1] if m
    return ''

  # Convert a base64 data-uri to a (hopefully) JSON string.
  _dataUri: (url) ->
    m = url.match(dataUriRe)
    return decodeBase64(m[1]) if m
    return ''


module.exports = SourceMapObtainer
