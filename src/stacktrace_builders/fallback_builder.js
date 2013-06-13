var match_message_file_line_column = /\s+([^\(]+)\s+\((.*):(\d+):(\d+)\)/;

function recognizeFrame(string) {
  var func,
      url,
      line,
      column;

  var match;

  match = string.match(match_message_file_line_column);
  if (match) {
    func   = match[1];
    url    = match[2];
    line   = match[3];
    column = match[4];
  }

  // Function falls back to entire string if
  // the function name can't be extracted
  func = func || string;

  return {
    func: func,
    url: url || "unsupported.js",
    line: line || "0",
    context: null,
    column: column || "0"
  };
}

function FallbackBuilder(error) {
  var result = [], i,
      stack = (error.stack || "").split("\n");

  for (i = stack.length - 1; i >= 0; i--) {
    result[i] = recognizeFrame(stack[i]);
  }

  return result;
}

module.exports = FallbackBuilder;
