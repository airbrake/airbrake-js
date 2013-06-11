// We have to rely on the magic locals provided by header.js right now
// Once we're decoupled we'll be able to require notifier directly
var Notifier = require("../concat-dist");

var Global = ("undefined" === typeof GLOBAL ? this : GLOBAL);

// TODO: Drive this from somewhere rather than having it happen automatically
Global.onerror = function (message, file, line) {
  setTimeout(function () {
    new Notifier().notify({
      message: message,
      stack: '()@' + file + ':' + line
    });
  }, 0);

  return true;
};
