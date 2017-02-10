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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function instrumentJQuery(client, jq) {
    if (jq === void 0) { jq = window.jQuery; }
    function wrapArgs(args) {
        for (var i in args) {
            var arg = args[i];
            var type = typeof arg;
            if (type === 'function') {
                args[i] = client.wrap(arg);
            }
            else if (Array.isArray(arg)) {
                // Wrap recursively.
                args[i] = wrapArgs(arg);
            }
            return args;
        }
    }
    // Reports exceptions thrown in jQuery event handlers.
    var jqEventAdd = jq.event.add;
    jq.event.add = function (elem, types, handler, data, selector) {
        if (handler.handler) {
            if (!handler.handler.guid) {
                handler.handler.guid = jq.guid++;
            }
            handler.handler = client.wrap(handler.handler);
        }
        else {
            if (!handler.guid) {
                handler.guid = jq.guid++;
            }
            handler = client.wrap(handler);
        }
        return jqEventAdd(elem, types, handler, data, selector);
    };
    // Reports exceptions thrown in jQuery callbacks.
    var jqCallbacks = jq.Callbacks;
    jq.Callbacks = function (options) {
        var cb = jqCallbacks(options);
        var cbAdd = cb.add;
        cb.add = function () {
            var args = Array.prototype.slice.call(arguments);
            return cbAdd.apply(this, wrapArgs(args));
        };
        return cb;
    };
    // Reports exceptions thrown in jQuery ready callbacks.
    var jqReady = jq.fn.ready;
    jq.fn.ready = function (fn) {
        return jqReady(client.wrap(fn));
    };
    return jq;
}
module.exports = instrumentJQuery;


/***/ })
/******/ ]);
});
//# sourceMappingURL=jquery.js.map