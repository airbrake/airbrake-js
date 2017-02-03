(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["jquery"] = factory();
	else
		root["airbrakeJs"] = root["airbrakeJs"] || {}, root["airbrakeJs"]["instrumentation"] = root["airbrakeJs"]["instrumentation"] || {}, root["airbrakeJs"]["instrumentation"]["jquery"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {var instrumentJQuery;

instrumentJQuery = function(client, jq) {
  var jqCallbacks, jqEventAdd, jqReady, wrapArguments;
  if (jq == null) {
    jq = global.jQuery;
  }
  wrapArguments = function(args) {
    var arg, i, j, len, type;
    for (i = j = 0, len = args.length; j < len; i = ++j) {
      arg = args[i];
      type = typeof arg;
      if (type === 'function') {
        args[i] = client.wrap(arg);
      } else if (arg && arg.length && type !== 'string') {
        args[i] = wrapArguments(arg);
      }
    }
    return args;
  };
  jqEventAdd = jq.event.add;
  jq.event.add = function(elem, types, handler, data, selector) {
    if (handler.handler) {
      if (!handler.handler.guid) {
        handler.handler.guid = jq.guid++;
      }
      handler.handler = client.wrap(handler.handler);
    } else {
      if (!handler.guid) {
        handler.guid = jq.guid++;
      }
      handler = client.wrap(handler);
    }
    return jqEventAdd(elem, types, handler, data, selector);
  };
  jqCallbacks = jq.Callbacks;
  jq.Callbacks = function(options) {
    var cb, cbAdd;
    cb = jqCallbacks(options);
    cbAdd = cb.add;
    cb.add = function() {
      return cbAdd.apply(this, wrapArguments(arguments));
    };
    return cb;
  };
  jqReady = jq.fn.ready;
  jq.fn.ready = function(fn) {
    return jqReady(client.wrap(fn));
  };
  return jq;
};

module.exports = instrumentJQuery;

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ })
/******/ ]);
});
//# sourceMappingURL=jquery.js.map