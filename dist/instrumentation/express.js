/*! airbrake-js v1.6.2 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["hapi"] = factory();
	else
		root["airbrakeJs"] = root["airbrakeJs"] || {}, root["airbrakeJs"]["instrumentation"] = root["airbrakeJs"]["instrumentation"] || {}, root["airbrakeJs"]["instrumentation"]["hapi"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/instrumentation/express.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/instrumentation/express.ts":
/*!****************************************!*\
  !*** ./src/instrumentation/express.ts ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function now() {
    if (process && process.hrtime) {
        return process.hrtime();
    }
    return Date.now();
}
function makeMiddleware(client) {
    return function airbrakeMiddleware(req, res, next) {
        var start = now();
        next();
        var end = now();
        var route = req.route ? req.route.path : req.url;
        client.notifyRequest({
            method: req.method,
            route: route,
            statusCode: res.statusCode,
            start: start,
            end: end,
        });
    };
}
function makeErrorHandler(client) {
    return function airbrakeErrorHandler(err, req, _res, next) {
        var url = req.protocol + '://' + req.headers['host'] + req.path;
        var action = req.route ? req.route.stack[0].name : '';
        var notice = {
            error: err,
            context: {
                userAddr: req.ip,
                userAgent: req.headers['user-agent'],
                url: url,
                route: req.route ? req.route.path : '',
                httpMethod: req.method,
                component: 'express',
                action: action,
            },
        };
        var referer = req.headers['referer'];
        if (referer) {
            notice.context.referer = referer;
        }
        client.notify(notice);
        next(err);
    };
}
// Hack to preserve backwards compatibility.
makeErrorHandler.makeMiddleware = makeMiddleware;
makeErrorHandler.makeErrorHandler = makeErrorHandler;
module.exports = makeErrorHandler;


/***/ })

/******/ });
});
//# sourceMappingURL=express.js.map