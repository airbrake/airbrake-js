var Notifier = require("../notifier");

window.onerror = function (message, file, line) {
  setTimeout(function () {
    new Notifier().notify({
      message: message,
      stack: '()@' + file + ':' + line
    });
  }, 0);

  return true;
};
