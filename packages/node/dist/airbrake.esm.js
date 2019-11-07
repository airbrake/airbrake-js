import ErrorStackParser from 'error-stack-parser';
import fetch from 'cross-fetch';
import { createHook, executionAsyncId } from 'async_hooks';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var FILTERED = '[Filtered]';
var MAX_OBJ_LENGTH = 128;
// jsonifyNotice serializes notice to JSON and truncates params,
// environment and session keys.
function jsonifyNotice(notice, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.maxLength, maxLength = _c === void 0 ? 64000 : _c, _d = _b.keysBlacklist, keysBlacklist = _d === void 0 ? [] : _d;
    if (notice.errors) {
        for (var i = 0; i < notice.errors.length; i++) {
            var t = new Truncator({ keysBlacklist: keysBlacklist });
            notice.errors[i] = t.truncate(notice.errors[i]);
        }
    }
    var s = '';
    var keys = ['context', 'params', 'environment', 'session'];
    for (var level = 0; level < 8; level++) {
        var opts = { level: level, keysBlacklist: keysBlacklist };
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var obj = notice[key];
            if (obj) {
                notice[key] = truncate(obj, opts);
            }
        }
        s = JSON.stringify(notice);
        if (s.length < maxLength) {
            return s;
        }
    }
    var params = {
        json: s.slice(0, Math.floor(maxLength / 2)) + '...',
    };
    keys.push('errors');
    for (var _e = 0, keys_2 = keys; _e < keys_2.length; _e++) {
        var key = keys_2[_e];
        var obj = notice[key];
        if (!obj) {
            continue;
        }
        s = JSON.stringify(obj);
        params[key] = s.length;
    }
    var err = new Error("airbrake: notice exceeds max length and can't be truncated");
    err.params = params;
    throw err;
}
function scale(num, level) {
    return num >> level || 1;
}
var Truncator = /** @class */ (function () {
    function Truncator(opts) {
        this.maxStringLength = 1024;
        this.maxObjectLength = MAX_OBJ_LENGTH;
        this.maxArrayLength = MAX_OBJ_LENGTH;
        this.maxDepth = 8;
        this.keys = [];
        this.keysBlacklist = [];
        this.seen = [];
        var level = opts.level || 0;
        this.keysBlacklist = opts.keysBlacklist || [];
        this.maxStringLength = scale(this.maxStringLength, level);
        this.maxObjectLength = scale(this.maxObjectLength, level);
        this.maxArrayLength = scale(this.maxArrayLength, level);
        this.maxDepth = scale(this.maxDepth, level);
    }
    Truncator.prototype.truncate = function (value, key, depth) {
        if (key === void 0) { key = ''; }
        if (depth === void 0) { depth = 0; }
        if (value === null || value === undefined) {
            return value;
        }
        switch (typeof value) {
            case 'boolean':
            case 'number':
            case 'function':
                return value;
            case 'string':
                return this.truncateString(value);
            case 'object':
                break;
            default:
                return this.truncateString(String(value));
        }
        if (value instanceof String) {
            return this.truncateString(value.toString());
        }
        if (value instanceof Boolean ||
            value instanceof Number ||
            value instanceof Date ||
            value instanceof RegExp) {
            return value;
        }
        if (value instanceof Error) {
            return this.truncateString(value.toString());
        }
        if (this.seen.indexOf(value) >= 0) {
            return "[Circular " + this.getPath(value) + "]";
        }
        var type = objectType(value);
        depth++;
        if (depth > this.maxDepth) {
            return "[Truncated " + type + "]";
        }
        this.keys.push(key);
        this.seen.push(value);
        switch (type) {
            case 'Array':
                return this.truncateArray(value, depth);
            case 'Object':
                return this.truncateObject(value, depth);
            default:
                var saved = this.maxDepth;
                this.maxDepth = 0;
                var obj = this.truncateObject(value, depth);
                obj.__type = type;
                this.maxDepth = saved;
                return obj;
        }
    };
    Truncator.prototype.getPath = function (value) {
        var index = this.seen.indexOf(value);
        var path = [this.keys[index]];
        for (var i = index; i >= 0; i--) {
            var sub = this.seen[i];
            if (sub && getAttr(sub, path[0]) === value) {
                value = sub;
                path.unshift(this.keys[i]);
            }
        }
        return '~' + path.join('.');
    };
    Truncator.prototype.truncateString = function (s) {
        if (s.length > this.maxStringLength) {
            return s.slice(0, this.maxStringLength) + '...';
        }
        return s;
    };
    Truncator.prototype.truncateArray = function (arr, depth) {
        if (depth === void 0) { depth = 0; }
        var length = 0;
        var dst = [];
        for (var i = 0; i < arr.length; i++) {
            var el = arr[i];
            dst.push(this.truncate(el, i.toString(), depth));
            length++;
            if (length >= this.maxArrayLength) {
                break;
            }
        }
        return dst;
    };
    Truncator.prototype.truncateObject = function (obj, depth) {
        if (depth === void 0) { depth = 0; }
        var length = 0;
        var dst = {};
        for (var key in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, key)) {
                continue;
            }
            if (isBlacklisted(key, this.keysBlacklist)) {
                dst[key] = FILTERED;
                continue;
            }
            var value = getAttr(obj, key);
            if (value === undefined || typeof value === 'function') {
                continue;
            }
            dst[key] = this.truncate(value, key, depth);
            length++;
            if (length >= this.maxObjectLength) {
                break;
            }
        }
        return dst;
    };
    return Truncator;
}());
function truncate(value, opts) {
    if (opts === void 0) { opts = {}; }
    var t = new Truncator(opts);
    return t.truncate(value);
}
function getAttr(obj, attr) {
    // Ignore browser specific exception trying to read an attribute (#79).
    try {
        return obj[attr];
    }
    catch (_) {
        return;
    }
}
function objectType(obj) {
    var s = Object.prototype.toString.apply(obj);
    return s.slice('[object '.length, -1);
}
function isBlacklisted(key, keysBlacklist) {
    for (var _i = 0, keysBlacklist_1 = keysBlacklist; _i < keysBlacklist_1.length; _i++) {
        var v = keysBlacklist_1[_i];
        if (v === key) {
            return true;
        }
        if (v instanceof RegExp) {
            if (key.match(v)) {
                return true;
            }
        }
    }
    return false;
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics$1 = function(d, b) {
    extendStatics$1 = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics$1(d, b);
};

function __extends$1(d, b) {
    extendStatics$1(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var Span = /** @class */ (function () {
    function Span(metric, name, startTime) {
        this._dur = 0;
        this._level = 0;
        this._metric = metric;
        this.name = name;
        this.startTime = startTime || new Date();
    }
    Span.prototype.end = function (endTime) {
        if (endTime) {
            this.endTime = endTime;
        }
        else {
            this.endTime = new Date();
        }
        this._dur += this.endTime.getTime() - this.startTime.getTime();
        this._metric._incGroup(this.name, this._dur);
        this._metric = null;
    };
    Span.prototype._pause = function () {
        if (this._paused()) {
            return;
        }
        var now = new Date();
        this._dur += now.getTime() - this.startTime.getTime();
        this.startTime = null;
    };
    Span.prototype._resume = function () {
        if (!this._paused()) {
            return;
        }
        this.startTime = new Date();
    };
    Span.prototype._paused = function () {
        return this.startTime == null;
    };
    return Span;
}());
var BaseMetric = /** @class */ (function () {
    function BaseMetric() {
        this._spans = {};
        this._groups = {};
        this.startTime = new Date();
    }
    BaseMetric.prototype.end = function (endTime) {
        if (!this.endTime) {
            this.endTime = endTime || new Date();
        }
    };
    BaseMetric.prototype.isRecording = function () {
        return true;
    };
    BaseMetric.prototype.startSpan = function (name, startTime) {
        var span = this._spans[name];
        if (span) {
            span._level++;
        }
        else {
            span = new Span(this, name, startTime);
            this._spans[name] = span;
        }
    };
    BaseMetric.prototype.endSpan = function (name, endTime) {
        var span = this._spans[name];
        if (!span) {
            console.error('airbrake: span=%s does not exist', name);
            return;
        }
        if (span._level > 0) {
            span._level--;
        }
        else {
            span.end(endTime);
            delete this._spans[span.name];
        }
    };
    BaseMetric.prototype._incGroup = function (name, ms) {
        this._groups[name] = (this._groups[name] || 0) + ms;
    };
    BaseMetric.prototype._duration = function () {
        if (!this.endTime) {
            this.endTime = new Date();
        }
        return this.endTime.getTime() - this.startTime.getTime();
    };
    return BaseMetric;
}());
var NoopMetric = /** @class */ (function () {
    function NoopMetric() {
    }
    NoopMetric.prototype.isRecording = function () {
        return false;
    };
    NoopMetric.prototype.startSpan = function (_name, _startTime) { };
    NoopMetric.prototype.endSpan = function (_name, _startTime) { };
    NoopMetric.prototype._incGroup = function (_name, _ms) { };
    return NoopMetric;
}());

var Scope = /** @class */ (function () {
    function Scope() {
        this._noopMetric = new NoopMetric();
        this._context = {};
        this._historyMaxLen = 20;
        this._history = [];
    }
    Scope.prototype.clone = function () {
        var clone = new Scope();
        clone._context = __assign({}, this._context);
        clone._history = this._history.slice();
        return clone;
    };
    Scope.prototype.setContext = function (context) {
        this._context = Object.assign(this._context, context);
    };
    Scope.prototype.context = function () {
        var ctx = __assign({}, this._context);
        if (this._history.length > 0) {
            ctx.history = this._history.slice();
        }
        return ctx;
    };
    Scope.prototype.pushHistory = function (state) {
        if (this._isDupState(state)) {
            if (this._lastRecord.num) {
                this._lastRecord.num++;
            }
            else {
                this._lastRecord.num = 2;
            }
            return;
        }
        if (!state.date) {
            state.date = new Date();
        }
        this._history.push(state);
        this._lastRecord = state;
        if (this._history.length > this._historyMaxLen) {
            this._history = this._history.slice(-this._historyMaxLen);
        }
    };
    Scope.prototype._isDupState = function (state) {
        if (!this._lastRecord) {
            return false;
        }
        for (var key in state) {
            if (!state.hasOwnProperty(key) || key === 'date') {
                continue;
            }
            if (state[key] !== this._lastRecord[key]) {
                return false;
            }
        }
        return true;
    };
    Scope.prototype.routeMetric = function () {
        return this._routeMetric || this._noopMetric;
    };
    Scope.prototype.setRouteMetric = function (metric) {
        this._routeMetric = metric;
    };
    Scope.prototype.queueMetric = function () {
        return this._queueMetric || this._noopMetric;
    };
    Scope.prototype.setQueueMetric = function (metric) {
        this._queueMetric = metric;
    };
    return Scope;
}());

var hasConsole = typeof console === 'object' && console.warn;
function parse(err) {
    try {
        return ErrorStackParser.parse(err);
    }
    catch (parseErr) {
        if (hasConsole && err.stack) {
            console.warn('ErrorStackParser:', parseErr.toString(), err.stack);
        }
    }
    if (err.fileName) {
        return [err];
    }
    return [];
}
function espProcessor(err) {
    var backtrace = [];
    if (err.noStack) {
        backtrace.push({
            function: err.functionName || '',
            file: err.fileName || '',
            line: err.lineNumber || 0,
            column: err.columnNumber || 0,
        });
    }
    else {
        var frames_2 = parse(err);
        if (frames_2.length === 0) {
            try {
                throw new Error('fake');
            }
            catch (fakeErr) {
                frames_2 = parse(fakeErr);
                frames_2.shift();
                frames_2.shift();
            }
        }
        for (var _i = 0, frames_1 = frames_2; _i < frames_1.length; _i++) {
            var frame = frames_1[_i];
            backtrace.push({
                function: frame.functionName || '',
                file: frame.fileName || '',
                line: frame.lineNumber || 0,
                column: frame.columnNumber || 0,
            });
        }
    }
    var type = err.name ? err.name : '';
    var msg = err.message ? String(err.message) : String(err);
    return {
        type: type,
        message: msg,
        backtrace: backtrace,
    };
}

var re = new RegExp([
    '^',
    '\\[(\\$.+)\\]',
    '\\s',
    '([\\s\\S]+)',
    '$',
].join(''));
function angularMessageFilter(notice) {
    var err = notice.errors[0];
    if (err.type !== '' && err.type !== 'Error') {
        return notice;
    }
    var m = err.message.match(re);
    if (m !== null) {
        err.type = m[1];
        err.message = m[2];
    }
    return notice;
}

function makeDebounceFilter() {
    var lastNoticeJSON;
    var timeout;
    return function (notice) {
        var s = JSON.stringify(notice.errors);
        if (s === lastNoticeJSON) {
            return null;
        }
        if (timeout) {
            clearTimeout(timeout);
        }
        lastNoticeJSON = s;
        timeout = setTimeout(function () {
            lastNoticeJSON = '';
        }, 1000);
        return notice;
    };
}

var IGNORED_MESSAGES = [
    'Script error',
    'Script error.',
    'InvalidAccessError',
];
function ignoreNoiseFilter(notice) {
    var err = notice.errors[0];
    if (err.type === '' && IGNORED_MESSAGES.indexOf(err.message) !== -1) {
        return null;
    }
    if (err.backtrace && err.backtrace.length > 0) {
        var frame = err.backtrace[0];
        if (frame.file === '<anonymous>') {
            return null;
        }
    }
    return notice;
}

var re$1 = new RegExp([
    '^',
    'Uncaught\\s',
    '(.+?)',
    ':\\s',
    '(.+)',
    '$',
].join(''));
function uncaughtMessageFilter(notice) {
    var err = notice.errors[0];
    if (err.type !== '' && err.type !== 'Error') {
        return notice;
    }
    var m = err.message.match(re$1);
    if (m !== null) {
        err.type = m[1];
        err.message = m[2];
    }
    return notice;
}

var errors = {
    unauthorized: new Error('airbrake: unauthorized: project id or key are wrong'),
    ipRateLimited: new Error('airbrake: IP is rate limited'),
};

var rateLimitReset = 0;
function request(req) {
    var utime = Date.now() / 1000;
    if (utime < rateLimitReset) {
        return Promise.reject(errors.ipRateLimited);
    }
    var opt = {
        method: req.method,
        body: req.body,
    };
    return fetch(req.url, opt).then(function (resp) {
        if (resp.status === 401) {
            throw errors.unauthorized;
        }
        if (resp.status === 429) {
            var s = resp.headers.get('X-RateLimit-Delay');
            if (!s) {
                throw errors.ipRateLimited;
            }
            var n = parseInt(s, 10);
            if (n > 0) {
                rateLimitReset = Date.now() / 1000 + n;
            }
            throw errors.ipRateLimited;
        }
        if (resp.status === 204) {
            return { json: null };
        }
        if (resp.status === 404) {
            throw new Error('404 Not Found');
        }
        if (resp.status >= 200 && resp.status < 300) {
            return resp.json().then(function (json) {
                return { json: json };
            });
        }
        if (resp.status >= 400 && resp.status < 500) {
            return resp.json().then(function (json) {
                var err = new Error(json.message);
                throw err;
            });
        }
        return resp.text().then(function (body) {
            var err = new Error("airbrake: fetch: unexpected response: code=" + resp.status + " body='" + body + "'");
            throw err;
        });
    });
}

function makeRequester(api) {
    return function (req) {
        return request$1(req, api);
    };
}
var rateLimitReset$1 = 0;
function request$1(req, api) {
    var utime = Date.now() / 1000;
    if (utime < rateLimitReset$1) {
        return Promise.reject(errors.ipRateLimited);
    }
    return new Promise(function (resolve, reject) {
        api({
            url: req.url,
            method: req.method,
            body: req.body,
            headers: {
                'content-type': 'application/json',
            },
            timeout: req.timeout,
        }, function (error, resp, body) {
            if (error) {
                reject(error);
                return;
            }
            if (!resp.statusCode) {
                error = new Error("airbrake: request: response statusCode is " + resp.statusCode);
                reject(error);
                return;
            }
            if (resp.statusCode === 401) {
                reject(errors.unauthorized);
                return;
            }
            if (resp.statusCode === 429) {
                reject(errors.ipRateLimited);
                var h = resp.headers['x-ratelimit-delay'];
                if (!h) {
                    return;
                }
                var s = void 0;
                if (typeof h === 'string') {
                    s = h;
                }
                else if (h instanceof Array) {
                    s = h[0];
                }
                else {
                    return;
                }
                var n = parseInt(s, 10);
                if (n > 0) {
                    rateLimitReset$1 = Date.now() / 1000 + n;
                }
                return;
            }
            if (resp.statusCode === 204) {
                resolve({ json: null });
                return;
            }
            if (resp.statusCode >= 200 && resp.statusCode < 300) {
                var json = void 0;
                try {
                    json = JSON.parse(body);
                }
                catch (err) {
                    reject(err);
                    return;
                }
                resolve(json);
                return;
            }
            if (resp.statusCode >= 400 && resp.statusCode < 500) {
                var json = void 0;
                try {
                    json = JSON.parse(body);
                }
                catch (err) {
                    reject(err);
                    return;
                }
                error = new Error(json.message);
                reject(error);
                return;
            }
            body = body.trim();
            error = new Error("airbrake: node: unexpected response: code=" + resp.statusCode + " body='" + body + "'");
            reject(error);
        });
    });
}

function makeRequester$1(opts) {
    if (opts.request) {
        return makeRequester(opts.request);
    }
    return request;
}

var tdigest = require('tdigest');
var TDigestStat = /** @class */ (function () {
    function TDigestStat() {
        this.count = 0;
        this.sum = 0;
        this.sumsq = 0;
        this._td = new tdigest.Digest();
    }
    TDigestStat.prototype.add = function (ms) {
        if (ms === 0) {
            ms = 0.00001;
        }
        this.count += 1;
        this.sum += ms;
        this.sumsq += ms * ms;
        this._td.push(ms);
    };
    TDigestStat.prototype.toJSON = function () {
        return {
            count: this.count,
            sum: this.sum,
            sumsq: this.sumsq,
            tdigestCentroids: tdigestCentroids(this._td),
        };
    };
    return TDigestStat;
}());
var TDigestStatGroups = /** @class */ (function (_super) {
    __extends$1(TDigestStatGroups, _super);
    function TDigestStatGroups() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.groups = {};
        return _this;
    }
    TDigestStatGroups.prototype.addGroups = function (totalMs, groups) {
        this.add(totalMs);
        for (var name_1 in groups) {
            this.addGroup(name_1, groups[name_1]);
        }
    };
    TDigestStatGroups.prototype.addGroup = function (name, ms) {
        var stat = this.groups[name];
        if (!stat) {
            stat = new TDigestStat();
            this.groups[name] = stat;
        }
        stat.add(ms);
    };
    TDigestStatGroups.prototype.toJSON = function () {
        return {
            count: this.count,
            sum: this.sum,
            sumsq: this.sumsq,
            tdigestCentroids: tdigestCentroids(this._td),
            groups: this.groups,
        };
    };
    return TDigestStatGroups;
}(TDigestStat));
function tdigestCentroids(td) {
    var means = [];
    var counts = [];
    td.centroids.each(function (c) {
        means.push(c.mean);
        counts.push(c.n);
    });
    return {
        mean: means,
        count: counts,
    };
}

var FLUSH_INTERVAL = 15000; // 15 seconds
var RouteMetric = /** @class */ (function (_super) {
    __extends$1(RouteMetric, _super);
    function RouteMetric(method, route, statusCode, contentType) {
        if (method === void 0) { method = ''; }
        if (route === void 0) { route = ''; }
        if (statusCode === void 0) { statusCode = 0; }
        if (contentType === void 0) { contentType = ''; }
        var _this = _super.call(this) || this;
        _this.method = method;
        _this.route = route;
        _this.statusCode = statusCode;
        _this.contentType = contentType;
        _this.startTime = new Date();
        return _this;
    }
    return RouteMetric;
}(BaseMetric));
var RoutesStats = /** @class */ (function () {
    function RoutesStats(opt) {
        this._m = {};
        this._opt = opt;
        this._url = opt.host + "/api/v5/projects/" + opt.projectId + "/routes-stats?key=" + opt.projectKey;
        this._requester = makeRequester$1(opt);
    }
    RoutesStats.prototype.notify = function (req) {
        var _this = this;
        var ms = req._duration();
        var minute = 60 * 1000;
        var startTime = new Date(Math.floor(req.startTime.getTime() / minute) * minute);
        var key = {
            method: req.method,
            route: req.route,
            statusCode: req.statusCode,
            time: startTime,
        };
        var keyStr = JSON.stringify(key);
        var stat = this._m[keyStr];
        if (!stat) {
            stat = new TDigestStat();
            this._m[keyStr] = stat;
        }
        stat.add(ms);
        if (this._timer) {
            return;
        }
        this._timer = setTimeout(function () {
            _this._flush();
        }, FLUSH_INTERVAL);
    };
    RoutesStats.prototype._flush = function () {
        var routes = [];
        for (var keyStr in this._m) {
            if (!this._m.hasOwnProperty(keyStr)) {
                continue;
            }
            var key = JSON.parse(keyStr);
            var v = __assign(__assign({}, key), this._m[keyStr].toJSON());
            routes.push(v);
        }
        this._m = {};
        this._timer = null;
        var outJSON = JSON.stringify({
            environment: this._opt.environment,
            routes: routes,
        });
        var req = {
            method: 'PUT',
            url: this._url,
            body: outJSON,
        };
        this._requester(req)
            .then(function (_resp) {
            // nothing
        })
            .catch(function (err) {
            if (console.error) {
                console.error('can not report routes stats', err);
            }
        });
    };
    return RoutesStats;
}());
var RoutesBreakdowns = /** @class */ (function () {
    function RoutesBreakdowns(opt) {
        this._m = {};
        this._opt = opt;
        this._url = opt.host + "/api/v5/projects/" + opt.projectId + "/routes-breakdowns?key=" + opt.projectKey;
        this._requester = makeRequester$1(opt);
    }
    RoutesBreakdowns.prototype.notify = function (req) {
        var _this = this;
        if (req.statusCode < 200 ||
            (req.statusCode >= 300 && req.statusCode < 400) ||
            req.statusCode === 404 ||
            Object.keys(req._groups).length === 0) {
            return;
        }
        var ms = req._duration();
        if (ms === 0) {
            ms = 0.00001;
        }
        var minute = 60 * 1000;
        var startTime = new Date(Math.floor(req.startTime.getTime() / minute) * minute);
        var key = {
            method: req.method,
            route: req.route,
            responseType: this._responseType(req),
            time: startTime,
        };
        var keyStr = JSON.stringify(key);
        var stat = this._m[keyStr];
        if (!stat) {
            stat = new TDigestStatGroups();
            this._m[keyStr] = stat;
        }
        stat.addGroups(ms, req._groups);
        if (this._timer) {
            return;
        }
        this._timer = setTimeout(function () {
            _this._flush();
        }, FLUSH_INTERVAL);
    };
    RoutesBreakdowns.prototype._flush = function () {
        var routes = [];
        for (var keyStr in this._m) {
            if (!this._m.hasOwnProperty(keyStr)) {
                continue;
            }
            var key = JSON.parse(keyStr);
            var v = __assign(__assign({}, key), this._m[keyStr].toJSON());
            routes.push(v);
        }
        this._m = {};
        this._timer = null;
        var outJSON = JSON.stringify({
            environment: this._opt.environment,
            routes: routes,
        });
        var req = {
            method: 'PUT',
            url: this._url,
            body: outJSON,
        };
        this._requester(req)
            .then(function (_resp) {
            // nothing
        })
            .catch(function (err) {
            if (console.error) {
                console.error('can not report routes breakdowns', err);
            }
        });
    };
    RoutesBreakdowns.prototype._responseType = function (req) {
        if (req.statusCode >= 500) {
            return '5xx';
        }
        if (req.statusCode >= 400) {
            return '4xx';
        }
        if (!req.contentType) {
            return '';
        }
        return req.contentType.split(';')[0].split('/')[-1];
    };
    return RoutesBreakdowns;
}());

var FLUSH_INTERVAL$1 = 15000; // 15 seconds
var QueueMetric = /** @class */ (function (_super) {
    __extends$1(QueueMetric, _super);
    function QueueMetric(queue) {
        var _this = _super.call(this) || this;
        _this.queue = queue;
        _this.startTime = new Date();
        return _this;
    }
    return QueueMetric;
}(BaseMetric));
var QueuesStats = /** @class */ (function () {
    function QueuesStats(opt) {
        this._m = {};
        this._opt = opt;
        this._url = opt.host + "/api/v5/projects/" + opt.projectId + "/queues-stats?key=" + opt.projectKey;
        this._requester = makeRequester$1(opt);
    }
    QueuesStats.prototype.notify = function (q) {
        var _this = this;
        var ms = q._duration();
        if (ms === 0) {
            ms = 0.00001;
        }
        var minute = 60 * 1000;
        var startTime = new Date(Math.floor(q.startTime.getTime() / minute) * minute);
        var key = {
            queue: q.queue,
            time: startTime,
        };
        var keyStr = JSON.stringify(key);
        var stat = this._m[keyStr];
        if (!stat) {
            stat = new TDigestStatGroups();
            this._m[keyStr] = stat;
        }
        stat.addGroups(ms, q._groups);
        if (this._timer) {
            return;
        }
        this._timer = setTimeout(function () {
            _this._flush();
        }, FLUSH_INTERVAL$1);
    };
    QueuesStats.prototype._flush = function () {
        var queues = [];
        for (var keyStr in this._m) {
            if (!this._m.hasOwnProperty(keyStr)) {
                continue;
            }
            var key = JSON.parse(keyStr);
            var v = __assign(__assign({}, key), this._m[keyStr].toJSON());
            queues.push(v);
        }
        this._m = {};
        this._timer = null;
        var outJSON = JSON.stringify({
            environment: this._opt.environment,
            queues: queues,
        });
        var req = {
            method: 'PUT',
            url: this._url,
            body: outJSON,
        };
        this._requester(req)
            .then(function (_resp) {
            // nothing
        })
            .catch(function (err) {
            if (console.error) {
                console.error('can not report queues breakdowns', err);
            }
        });
    };
    return QueuesStats;
}());

var FLUSH_INTERVAL$2 = 15000; // 15 seconds
var QueryInfo = /** @class */ (function () {
    function QueryInfo(query) {
        if (query === void 0) { query = ''; }
        this.method = '';
        this.route = '';
        this.query = '';
        this.func = '';
        this.file = '';
        this.line = 0;
        this.startTime = new Date();
        this.query = query;
    }
    QueryInfo.prototype._duration = function () {
        if (!this.endTime) {
            this.endTime = new Date();
        }
        return this.endTime.getTime() - this.startTime.getTime();
    };
    return QueryInfo;
}());
var QueriesStats = /** @class */ (function () {
    function QueriesStats(opt) {
        this._m = {};
        this._opt = opt;
        this._url = opt.host + "/api/v5/projects/" + opt.projectId + "/queries-stats?key=" + opt.projectKey;
        this._requester = makeRequester$1(opt);
    }
    QueriesStats.prototype.start = function (query) {
        if (query === void 0) { query = ''; }
        return new QueryInfo(query);
    };
    QueriesStats.prototype.notify = function (q) {
        var _this = this;
        var ms = q._duration();
        var minute = 60 * 1000;
        var startTime = new Date(Math.floor(q.startTime.getTime() / minute) * minute);
        var key = {
            method: q.method,
            route: q.route,
            query: q.query,
            func: q.func,
            file: q.file,
            line: q.line,
            time: startTime,
        };
        var keyStr = JSON.stringify(key);
        var stat = this._m[keyStr];
        if (!stat) {
            stat = new TDigestStat();
            this._m[keyStr] = stat;
        }
        stat.add(ms);
        if (this._timer) {
            return;
        }
        this._timer = setTimeout(function () {
            _this._flush();
        }, FLUSH_INTERVAL$2);
    };
    QueriesStats.prototype._flush = function () {
        var queries = [];
        for (var keyStr in this._m) {
            if (!this._m.hasOwnProperty(keyStr)) {
                continue;
            }
            var key = JSON.parse(keyStr);
            var v = __assign(__assign({}, key), this._m[keyStr].toJSON());
            queries.push(v);
        }
        this._m = {};
        this._timer = null;
        var outJSON = JSON.stringify({
            environment: this._opt.environment,
            queries: queries,
        });
        var req = {
            method: 'PUT',
            url: this._url,
            body: outJSON,
        };
        this._requester(req)
            .then(function (_resp) {
            // nothing
        })
            .catch(function (err) {
            if (console.error) {
                console.error('can not report queries stats', err);
            }
        });
    };
    return QueriesStats;
}());

var BaseNotifier = /** @class */ (function () {
    function BaseNotifier(opt) {
        var _this = this;
        this._filters = [];
        this._scope = new Scope();
        this._onClose = [];
        if (!opt.projectId || !opt.projectKey) {
            throw new Error('airbrake: projectId and projectKey are required');
        }
        this._opt = opt;
        this._opt.host = this._opt.host || 'https://api.airbrake.io';
        this._opt.timeout = this._opt.timeout || 10000;
        this._opt.keysBlacklist = this._opt.keysBlacklist || [/password/, /secret/];
        this._url = this._opt.host + "/api/v3/projects/" + this._opt.projectId + "/notices?key=" + this._opt.projectKey;
        this._processor = this._opt.processor || espProcessor;
        this._requester = makeRequester$1(this._opt);
        this.addFilter(ignoreNoiseFilter);
        this.addFilter(makeDebounceFilter());
        this.addFilter(uncaughtMessageFilter);
        this.addFilter(angularMessageFilter);
        this.addFilter(function (notice) {
            notice.context.notifier = {
                name: 'airbrake-js/browser',
                version: '1.0.3',
                url: 'https://github.com/airbrake/airbrake-js',
            };
            if (_this._opt.environment) {
                notice.context.environment = _this._opt.environment;
            }
            return notice;
        });
        this.routes = new Routes(this);
        this.queues = new Queues(this);
        this.queries = new QueriesStats(this._opt);
    }
    BaseNotifier.prototype.close = function () {
        for (var _i = 0, _a = this._onClose; _i < _a.length; _i++) {
            var fn = _a[_i];
            fn();
        }
    };
    BaseNotifier.prototype.scope = function () {
        return this._scope;
    };
    BaseNotifier.prototype.setActiveScope = function (scope) {
        this._scope = scope;
    };
    BaseNotifier.prototype.addFilter = function (filter) {
        this._filters.push(filter);
    };
    BaseNotifier.prototype.notify = function (err) {
        var notice = {
            errors: [],
            context: Object.assign({ severity: 'error' }, this.scope().context(), err.context),
            params: err.params || {},
            environment: err.environment || {},
            session: err.session || {},
        };
        if (typeof err !== 'object' || err.error === undefined) {
            err = { error: err };
        }
        if (!err.error) {
            notice.error = new Error("airbrake: got err=" + JSON.stringify(err.error) + ", wanted an Error");
            return Promise.resolve(notice);
        }
        var error = this._processor(err.error);
        notice.errors.push(error);
        for (var _i = 0, _a = this._filters; _i < _a.length; _i++) {
            var filter = _a[_i];
            var r = filter(notice);
            if (r === null) {
                notice.error = new Error('airbrake: error is filtered');
                return Promise.resolve(notice);
            }
            notice = r;
        }
        if (!notice.context) {
            notice.context = {};
        }
        notice.context.language = 'JavaScript';
        return this._sendNotice(notice);
    };
    BaseNotifier.prototype._sendNotice = function (notice) {
        var body = jsonifyNotice(notice, {
            keysBlacklist: this._opt.keysBlacklist,
        });
        if (this._opt.reporter) {
            if (typeof this._opt.reporter === 'function') {
                return this._opt.reporter(notice);
            }
            else {
                console.warn('airbrake: options.reporter must be a function');
            }
        }
        var req = {
            method: 'POST',
            url: this._url,
            body: body,
        };
        return this._requester(req)
            .then(function (resp) {
            notice.id = resp.json.id;
            return notice;
        })
            .catch(function (err) {
            notice.error = err;
            return notice;
        });
    };
    BaseNotifier.prototype.wrap = function (fn, props) {
        if (props === void 0) { props = []; }
        if (fn._airbrake) {
            return fn;
        }
        // tslint:disable-next-line:no-this-assignment
        var client = this;
        var airbrakeWrapper = function () {
            var fnArgs = Array.prototype.slice.call(arguments);
            var wrappedArgs = client._wrapArguments(fnArgs);
            try {
                return fn.apply(this, wrappedArgs);
            }
            catch (err) {
                client.notify({ error: err, params: { arguments: fnArgs } });
                this._ignoreNextWindowError();
                throw err;
            }
        };
        for (var prop in fn) {
            if (fn.hasOwnProperty(prop)) {
                airbrakeWrapper[prop] = fn[prop];
            }
        }
        for (var _i = 0, props_1 = props; _i < props_1.length; _i++) {
            var prop = props_1[_i];
            if (fn.hasOwnProperty(prop)) {
                airbrakeWrapper[prop] = fn[prop];
            }
        }
        airbrakeWrapper._airbrake = true;
        airbrakeWrapper.inner = fn;
        return airbrakeWrapper;
    };
    BaseNotifier.prototype._wrapArguments = function (args) {
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (typeof arg === 'function') {
                args[i] = this.wrap(arg);
            }
        }
        return args;
    };
    BaseNotifier.prototype._ignoreNextWindowError = function () { };
    BaseNotifier.prototype.call = function (fn) {
        var _args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _args[_i - 1] = arguments[_i];
        }
        var wrapper = this.wrap(fn);
        return wrapper.apply(this, Array.prototype.slice.call(arguments, 1));
    };
    return BaseNotifier;
}());
var Routes = /** @class */ (function () {
    function Routes(notifier) {
        this._notifier = notifier;
        this._routes = new RoutesStats(notifier._opt);
        this._breakdowns = new RoutesBreakdowns(notifier._opt);
    }
    Routes.prototype.start = function (method, route, statusCode, contentType) {
        if (method === void 0) { method = ''; }
        if (route === void 0) { route = ''; }
        if (statusCode === void 0) { statusCode = 0; }
        if (contentType === void 0) { contentType = ''; }
        var metric = new RouteMetric(method, route, statusCode, contentType);
        var scope = this._notifier.scope().clone();
        scope.setContext({ httpMethod: method, route: route });
        scope.setRouteMetric(metric);
        this._notifier.setActiveScope(scope);
        return metric;
    };
    Routes.prototype.notify = function (req) {
        req.end();
        this._routes.notify(req);
        this._breakdowns.notify(req);
    };
    return Routes;
}());
var Queues = /** @class */ (function () {
    function Queues(notifier) {
        this._notifier = notifier;
        this._queues = new QueuesStats(notifier._opt);
    }
    Queues.prototype.start = function (queue) {
        var metric = new QueueMetric(queue);
        var scope = this._notifier.scope().clone();
        scope.setContext({ queue: queue });
        scope.setQueueMetric(metric);
        this._notifier.setActiveScope(scope);
        return metric;
    };
    Queues.prototype.notify = function (q) {
        q.end();
        this._queues.notify(q);
    };
    return Queues;
}());

var os = require('os');
function nodeFilter(notice) {
    if (notice.context.notifier) {
        notice.context.notifier.name = 'airbrake-js/node';
    }
    notice.context.os = os.type() + "/" + os.release();
    notice.context.architecture = os.arch();
    notice.context.hostname = os.hostname();
    notice.params.os = {
        homedir: os.homedir(),
        uptime: os.uptime(),
        freemem: os.freemem(),
        totalmem: os.totalmem(),
        loadavg: os.loadavg(),
    };
    notice.context.platform = process.platform;
    if (!notice.context.rootDirectory) {
        notice.context.rootDirectory = process.cwd();
    }
    notice.params.process = {
        pid: process.pid,
        cwd: process.cwd(),
        execPath: process.execPath,
        argv: process.argv,
    };
    ['uptime', 'cpuUsage', 'memoryUsage'].map(function (name) {
        if (process[name]) {
            notice.params.process[name] = process[name]();
        }
    });
    return notice;
}

var ScopeManager = /** @class */ (function () {
    function ScopeManager() {
        this._scopes = {};
        this._asyncHook = createHook({
            init: this._init.bind(this),
            destroy: this._destroy.bind(this),
            promiseResolve: this._destroy.bind(this),
        })
            .enable();
    }
    ScopeManager.prototype.setActive = function (scope) {
        var eid = executionAsyncId();
        this._scopes[eid] = scope;
    };
    ScopeManager.prototype.active = function () {
        var eid = executionAsyncId();
        return this._scopes[eid];
    };
    ScopeManager.prototype._init = function (aid) {
        this._scopes[aid] = this._scopes[executionAsyncId()];
    };
    ScopeManager.prototype._destroy = function (aid) {
        delete this._scopes[aid];
    };
    return ScopeManager;
}());

var Notifier = /** @class */ (function (_super) {
    __extends(Notifier, _super);
    function Notifier(opt) {
        var _this = this;
        if (!opt.environment && process.env.NODE_ENV) {
            opt.environment = process.env.NODE_ENV;
        }
        _this = _super.call(this, opt) || this;
        _this.addFilter(nodeFilter);
        _this._inFlight = 0;
        _this._scopeManager = new ScopeManager();
        _this._mainScope = new Scope();
        process.on('beforeExit', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.flush()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        process.on('uncaughtException', function (err) {
            _this.notify(err).then(function () {
                if (process.listeners('uncaughtException').length !== 1) {
                    return;
                }
                if (console.error) {
                    console.error('uncaught exception', err);
                }
                process.exit(1);
            });
        });
        process.on('unhandledRejection', function (reason, _p) {
            var msg = reason.message || String(reason);
            if (msg.indexOf && msg.indexOf('airbrake: ') === 0) {
                return;
            }
            _this.notify(reason).then(function () {
                if (process.listeners('unhandledRejection').length !== 1) {
                    return;
                }
                if (console.error) {
                    console.error('unhandled rejection', reason);
                }
                process.exit(1);
            });
        });
        _this._instrument();
        return _this;
    }
    Notifier.prototype.scope = function () {
        var scope = this._scopeManager.active();
        if (scope) {
            return scope;
        }
        return this._mainScope;
    };
    Notifier.prototype.setActiveScope = function (scope) {
        this._scopeManager.setActive(scope);
    };
    Notifier.prototype.notify = function (err) {
        var _this = this;
        this._inFlight++;
        return _super.prototype.notify.call(this, err).finally(function () {
            _this._inFlight--;
        });
    };
    Notifier.prototype.flush = function (timeout) {
        if (timeout === void 0) { timeout = 3000; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this._inFlight === 0 || timeout <= 0) {
                    return [2 /*return*/, Promise.resolve(true)];
                }
                return [2 /*return*/, new Promise(function (resolve, _reject) {
                        var interval = timeout / 100;
                        if (interval <= 0) {
                            interval = 10;
                        }
                        var timerID = setInterval(function () {
                            if (_this._inFlight === 0) {
                                resolve(true);
                                clearInterval(timerID);
                                return;
                            }
                            if (timeout <= 0) {
                                resolve(false);
                                clearInterval(timerID);
                                return;
                            }
                            timeout -= interval;
                        }, interval);
                    })];
            });
        });
    };
    Notifier.prototype._instrument = function () {
        var mods = ['pg', 'mysql', 'mysql2', 'redis', 'http', 'https'];
        for (var _i = 0, mods_1 = mods; _i < mods_1.length; _i++) {
            var modName = mods_1[_i];
            try {
                var mod = require(modName);
                var airbrakeMod = require("@airbrake/node/dist/instrumentation/" + modName);
                airbrakeMod.patch(mod, this);
            }
            catch (_) { }
        }
    };
    return Notifier;
}(BaseNotifier));

export { Notifier };
//# sourceMappingURL=airbrake.esm.js.map
