;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
(function(global){// Generate bundle.js using browserify
//   ./node_modules/grunt-browserify/node_modules/browserify/bin/cmd.js -d test/examples/js/browserify/main.js -o test/examples/js/browserify/bundle.js
var ErrorMaker = require("./error_maker_module");
var ErrorCoffeeMaker = require("./error_coffee_maker_module.coffee");

global.ErrorMaker = ErrorMaker;
global.ErrorCoffeeMaker = ErrorCoffeeMaker;

})(window)
},{"./error_coffee_maker_module.coffee":2,"./error_maker_module":3}],2:[function(require,module,exports){
module.exports = function() {
  return 0.();
};


},{}],3:[function(require,module,exports){
module.exports = function ErrorMaker() {
  (0)();
};

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZHVuY2FuYmVldmVycy9Qcm9qZWN0cy9haXJicmFrZS9haXJicmFrZS1qcy90ZXN0L2V4YW1wbGVzL2pzL2Jyb3dzZXJpZnkvbWFpbi5qcyIsIi9Vc2Vycy9kdW5jYW5iZWV2ZXJzL1Byb2plY3RzL2FpcmJyYWtlL2FpcmJyYWtlLWpzL3Rlc3QvZXhhbXBsZXMvanMvYnJvd3NlcmlmeS9lcnJvcl9jb2ZmZWVfbWFrZXJfbW9kdWxlLmNvZmZlZSIsIi9Vc2Vycy9kdW5jYW5iZWV2ZXJzL1Byb2plY3RzL2FpcmJyYWtlL2FpcmJyYWtlLWpzL3Rlc3QvZXhhbXBsZXMvanMvYnJvd3NlcmlmeS9lcnJvcl9tYWtlcl9tb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQSxDQUFPLEVBQVUsR0FBWCxDQUFOLEVBQWlCO0NBQUcsUUFBQztDQUFKOzs7O0FDQWpCO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKGdsb2JhbCl7Ly8gR2VuZXJhdGUgYnVuZGxlLmpzIHVzaW5nIGJyb3dzZXJpZnlcbi8vICAgLi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9iaW4vY21kLmpzIC1kIHRlc3QvZXhhbXBsZXMvanMvYnJvd3NlcmlmeS9tYWluLmpzIC1vIHRlc3QvZXhhbXBsZXMvanMvYnJvd3NlcmlmeS9idW5kbGUuanNcbnZhciBFcnJvck1ha2VyID0gcmVxdWlyZShcIi4vZXJyb3JfbWFrZXJfbW9kdWxlXCIpO1xudmFyIEVycm9yQ29mZmVlTWFrZXIgPSByZXF1aXJlKFwiLi9lcnJvcl9jb2ZmZWVfbWFrZXJfbW9kdWxlLmNvZmZlZVwiKTtcblxuZ2xvYmFsLkVycm9yTWFrZXIgPSBFcnJvck1ha2VyO1xuZ2xvYmFsLkVycm9yQ29mZmVlTWFrZXIgPSBFcnJvckNvZmZlZU1ha2VyO1xuXG59KSh3aW5kb3cpIiwibW9kdWxlLmV4cG9ydHMgPSAtPiAoMCkoKVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBFcnJvck1ha2VyKCkge1xuICAoMCkoKTtcbn07XG4iXX0=
;