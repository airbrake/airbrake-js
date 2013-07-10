var source_maps_matcher = /\/\/(?:@|#) sourceMappingURL=(.+)$/,
    data_uri_matcher = /data:application\/json;base64,(.*)/;

function xhr(url, fn) {
  var request = new global.XMLHttpRequest();
  request.open('GET', url, true);
  request.send();
  request.onreadystatechange = function() {
    if (4 === request.readyState) { fn(request.responseText); }
  };
}

// Extract the source maps url (if any) from a corpus of text
function sourceMapUrl(body) {
  var body_match = body.match(source_maps_matcher);
  if (body_match) { return body_match[1]; }
}

// Convert a base64 data-uri to a (hopefully) JSON string
function dataUri(url) {
  var data_uri_match = url.match(data_uri_matcher);
  if (data_uri_match) {
    // It's a data-uri, extract JSON directly
    // TODO: Use cheaper base64 decode like atob
    // because browserify util stuff is big
    return new Buffer(data_uri_match[1], "base64").toString("utf-8");
  }
}

function SourcemapsObtainer() {
  function scriptReceived(body, obtained) {
    var url = sourceMapUrl(body);
    if (url) {
      var data_uri = dataUri(url);
      if (data_uri) {
        obtained(data_uri);
      } else {
        xhr(url, function(json) { obtained(json); });
      }
    } else {
      obtained(null);
    }
  }

  this.obtain = function(url, obtained) {
    // Closure around `obtained`
    xhr(url, function(body) { scriptReceived(body, obtained); });
  };
}

SourcemapsObtainer.sourceMapUrl = sourceMapUrl;
SourcemapsObtainer.dataUri = dataUri;

module.exports = SourcemapsObtainer;
