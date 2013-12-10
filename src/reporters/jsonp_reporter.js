var cb_count = 0;

function JsonpReporter(processor_name) {
  return function(notice, options) {
    var document    = global.document,
        head        = document.getElementsByTagName("head")[0],
        script_tag  = document.createElement("script"),
        body        = JSON.stringify(notice),
        cb_name     = "airbrake_cb_" + cb_count,
        prefix      = "https://api.airbrake.io",
        url         = prefix + "/api/v3/projects/" + options.projectId + "/create-notice?key=" + options.projectKey + "&callback=" + cb_name + "&body=" + encodeURIComponent(body);


    // Attach an anonymous function to the global namespace to consume the callback.
    // This pevents syntax errors from trying to directly execute the JSON response.
    global[cb_name] = function() { delete global[cb_name]; };
    cb_count += 1;

    function removeTag() {
      head.removeChild(script_tag);
      delete global[cb_name];
    }

    script_tag.src     = url;
    script_tag.type    = "text/javascript";
    script_tag.onload  = removeTag;
    script_tag.onerror = removeTag;

    head.appendChild(script_tag);
  };
}

JsonpReporter.resetCb = function() { cb_count = 0; };

module.exports = JsonpReporter;
