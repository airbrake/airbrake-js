// Airbrake JavaScript Notifier
(function() {
    "use strict";

    var NOTICE_XML = '<?xml version="1.0" encoding="UTF-8"?>' +
        '<notice version="2.0">' +
            '<api-key>{key}</api-key>' +
            '<notifier>' +
                '<name>airbrake_js</name>' +
                '<version>0.2.0</version>' +
                '<url>http://airbrake.io</url>' +
            '</notifier>' +
            '<error>' +
                '<class>{exception_class}</class>' +
                '<message>{exception_message}</message>' +
                '<backtrace>{backtrace_lines}</backtrace>' +
            '</error>' +
            '<request>' +
                '<url>{request_url}</url>' +
                '<component>{request_component}</component>' +
                '<action>{request_action}</action>' +
                '{request}' +
            '</request>' +
            '<server-environment>' +
                '<project-root>{project_root}</project-root>' +
                '<environment-name>{environment}</environment-name>' +
            '</server-environment>' +
        '</notice>',
        Config,
        Util;

    Util = {
        merge: (function() {
            function processProperty(key, dest, src) {
                if (src.hasOwnProperty(key)) {
                    dest[key] = src[key];
                }
            }

            return function() {
                var objects = Array.prototype.slice.call(arguments),
                    obj,
                    key,
                    result = {};

                while (obj = objects.shift()) {
                    for (key in obj) {
                        processProperty(key, result, obj);
                    }
                }

                return result;
            };
        })(),

        escape: function(text) {
            return text.replace(/&/g, '&#38;').replace(/</g, '&#60;').replace(/>/g, '&#62;')
                    .replace(/'/g, '&#39;').replace(/"/g, '&#34;');
        },

        trim: function (text) {
            return text.toString().replace(/^\s+/, '').replace(/\s+$/, '');
        },

        substitute: function(text, data, emptyForUndefinedData) {
            return text.replace(/{([\w_.-]+)}/g, function(match, key) {
                return (key in data) ? data[key] : (emptyForUndefinedData ? '' : match);
            });
        }
    };

    // Share Config to global scope as Airbrake ("window.Hoptoad" for backward compatibility)
    Config = window.Airbrake = window.Hoptoad = {
        xmlData: {
            environment: 'environment'
        },

        options: {
            host: 'api.airbrake.io',
            errorDefaults: {},
            guessFunctionName: false
        },

        setEnvironment: function (value) {
            this.xmlData['environment'] = value;
        },

        setKey: function (value) {
            this.xmlData['key'] = value;
        },

        setHost: function (value) {
            this.options['host'] = value;
        },

        setErrorDefaults: function (value) {
            this.options['errorDefaults'] = value;
        },

        setGuessFunctionName: function (value) {
            this.options['guessFunctionName'] = value;
        }
    };

    function Notifier() {
        this.options = Util.merge({}, Config.options);
        this.xmlData = Util.merge(this.DEF_XML_DATA, Config.xmlData);
    }
    Notifier.prototype = {
        constructor: Notifier,
        VERSION: '0.2.0',
        ROOT: window.location.protocol + '//' + window.location.host,
        BACKTRACE_MATCHER: /^(.*)\@(.*)\:(\d+)$/,
        backtrace_filters: [/notifier\.js/],
        DEF_XML_DATA: {
            request: ''
        },

        notify: function(error) {
            var xml = escape(this.generateXML(error)),
                url = '//' + this.options.host + '/notifier_api/v2/notices?data=' + xml,
                request = document.createElement('iframe');

            // console.log(unescape(xml));return;

            request.style.display = 'none';
            request.src = url;

            // When request has been sent, delete iframe
            request.onload = function () {
                // To avoid infinite progress indicator
                setTimeout(function() {
                    document.body.removeChild(request);
                }, 0);
            };

            document.body.appendChild(request);
        },

        generateXML: function(errorWithoutDefaults) {
            var xmlData = this.xmlData,
                cgi_data,
                i,
                methods,
                type,
                error = Util.merge(this.options.errorDefaults, errorWithoutDefaults),
                component = Util.trim(Util.escape(error.component || ''));

            xmlData.request_url = Util.trim(Util.escape((error.url || '') + location.hash));

            if (xmlData.request_url || component) {
                cgi_data = error['cgi-data'] || {};
                cgi_data.HTTP_USER_AGENT = navigator.userAgent;
                xmlData.request += '<cgi-data>' + this.generateVariables(cgi_data) + '</cgi-data>';

                methods = ['params', 'session'];

                for (i = 0; i < methods.length; i++) {
                    type = methods[i];

                    if (error[type]) {
                        xmlData.request += '<' + type + '>' + this.generateVariables(error[type]) + '</' + type + '>';
                    }
                }

                xmlData.request_url = Util.escape((error.url || '') + location.hash);
                xmlData.request_action = Util.escape(error.action || '');
                xmlData.request_component = component;
            }

            xmlData.project_root = this.ROOT;
            xmlData.exception_class = Util.escape(error.type || 'Error');
            xmlData.exception_message = Util.escape(error.message || 'Unknown error.');
            xmlData.backtrace_lines = this.generateBacktrace(error).join('');

            return Util.substitute(NOTICE_XML, xmlData, true);
        },

        generateBacktrace: function(error) {
            var backtrace = [],
                file,
                i,
                matches,
                stacktrace;

            error = error || {};

            if (typeof error.stack !== 'string') {
                try {
                    (0)();
                } catch (e) {
                    error.stack = e.stack;
                }
            }

            stacktrace = this.getStackTrace(error);

            for (i = 0; i < stacktrace.length; i++) {
                matches = stacktrace[i].match(this.BACKTRACE_MATCHER);

                if (matches && this.validBacktraceLine(stacktrace[i])) {
                    file = matches[2].replace(this.ROOT, '[PROJECT_ROOT]');

                    if (i === 0 && matches[2].match(document.location.href)) {
                        backtrace.push('<line method="" file="internal: " number=""/>');
                    }

                    backtrace.push('<line method="' + Util.escape(matches[1]) + '" file="' + Util.escape(file) +
                            '" number="' + matches[3] + '" />');
                }
            }

            return backtrace;
        },

        getStackTrace: function(error) {
            var i,
                stacktrace = printStackTrace({
                    e: error,
                    guess: this.options.guessFunctionName
                });

            for (i = 0; i < stacktrace.length; i++) {
                if (stacktrace[i].match(/\:\d+$/)) {
                    continue;
                }

                if (stacktrace[i].indexOf('@') === -1) {
                    stacktrace[i] += '@unsupported.js';
                }

                stacktrace[i] += ':0';
            }

            return stacktrace;
        },

        validBacktraceLine: function(line) {
            for (var i = 0; i < this.backtrace_filters.length; i++) {
                if (line.match(this.backtrace_filters[i])) {
                    return false;
                }
            }

            return true;
        },

        generateVariables: function (parameters) {
            var key,
                result = '';

            for (key in parameters) {
                if (parameters.hasOwnProperty(key)) {
                    result += '<var key="' + Util.escape(key) + '">' + Util.escape(parameters[key]) + '</var>';
                }
            }

            return result;
        }
    };

    window.onerror = function (message, file, line) {
        setTimeout(function () {
            new Notifier().notify({
                message: message,
                stack: '()@' + file + ':' + line
            });
        }, 0);

        return true;
    };
})();
