// We have to rely on the magic locals provided by header.js right now
// Once we're decoupled we'll be able to require notifier directly
var Notifier = require("../concat-dist");

window.onerror = function (message, file, line) {
  setTimeout(function () {
    new Notifier().notify({
      message: message,
      stack: '()@' + file + ':' + line
    });
  }, 0);

  return true;
};
