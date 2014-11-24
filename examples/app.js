function throwError(msg) {
  throw new Error(msg);
}

$(function() {
  $("#btn").click(function() {
    throwError("unhandled exception in the event handler");
  });
});
