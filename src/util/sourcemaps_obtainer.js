var source_maps_matcher = /\/\/@|# sourceMappingURL=(.*)/,
    data_uri_matcher = /data:application\/json;base64,(.*)/;

function xhr(url, fn) {
  var request = new global.XMLHttpRequest();
  request.open('GET', url, true);
  request.send();
  request.onreadystatechange = function() {
    if (4 === request.readyState) { fn(request.responseText); }
  };
}

function SourcemapsObtainer() {
  function scriptReceived(body, obtained) {
    var body_match = body.match(source_maps_matcher),
        source_maps_url, json;

    if (body_match) {
      source_maps_url = body_match[1];

      var data_uri_match = source_maps_url.match(data_uri_matcher);
      if (data_uri_match) {
        // It's a data-uri, extract JSON directly
        // TODO: Use cheaper base64 decode like atob
        // because browserify util stuff is big
        json = new Buffer(data_uri_match[1], "base64").toString("utf-8");
        obtained(json);
      } else {
        xhr(source_maps_url, function(json) { obtained(json); });
      }
    } else {
      obtained(null);
    }
  }

  this.obtain = function(url, obtained) {
    xhr(url, function(body) { scriptReceived(body, obtained); });
  };
}

module.exports = SourcemapsObtainer;
