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
        Global,
        Util,
        _publicAPI;

    Util = {
        merge: (function() {
            function processProperty (key, dest, src) {
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

        escape: function (text) {
            return text.replace(/&/g, '&#38;').replace(/</g, '&#60;').replace(/>/g, '&#62;')
                    .replace(/'/g, '&#39;').replace(/"/g, '&#34;');
        },

        trim: function (text) {
            return text.toString().replace(/^\s+/, '').replace(/\s+$/, '');
        },

        substitute: function (text, data, emptyForUndefinedData) {
            return text.replace(/{([\w_.-]+)}/g, function(match, key) {
                return (key in data) ? data[key] : (emptyForUndefinedData ? '' : match);
            });
        },

        processjQueryEventHandlerWrapping: function () {
            if (Config.options.trackJQ === true) {
                Config.jQuery_fn_on_original = Config.jQuery_fn_on_original || jQuery.fn.on;

                jQuery.fn.on = function () {
                    var args = Array.prototype.slice.call(arguments),
                        fnArgIdx = 4;

                    // Search index of function argument
                    while((--fnArgIdx > -1) && (typeof args[fnArgIdx] !== 'function'));

                    // If the function is not found, then subscribe original event handler function
                    if (fnArgIdx === -1) {
                        return Config.jQuery_fn_on_original.apply(this, arguments);
                    }

                    // If the function is found, then subscribe wrapped event handler function
                    args[fnArgIdx] = (function (fnOriginHandler) {
                        return function() {
                            try {
                                fnOriginHandler.apply(this, arguments);
                            } catch (e) {
                                Global.captureException(e);
                            }
                        };
                    })(args[fnArgIdx]);

                    return Config.jQuery_fn_on_original.apply(this, args);
                };
            } else {
                (typeof Config.jQuery_fn_on_original === 'function') && (jQuery.fn.on = Config.jQuery_fn_on_original);
            }
        },

        isjQueryPresent: function () {
            // Currently only 1.7.x version supported
            return (typeof jQuery === 'function') && ('fn' in jQuery) && ('jquery' in jQuery.fn)
                    && (jQuery.fn.jquery.indexOf('1.7') === 0)
        },
        
        /*
         * Make first letter in a string capital. e.g. 'guessFunctionName' -> 'GuessFunctionName'
         * Is used to generate getter and setter method names.
         */
        capitalizeFirstLetter: function (str) {
            return str[0].toUpperCase() + str.slice(1);  
        },
        
        /*
         * Generate public API from an array of specifically formated objects, e.g.
         * 
         * - this will generate 'setEnvironment' and 'getEnvironment' API methods for configObj.xmlData.environment variable:
         * {
         *     variable: 'environment',
         *     namespace: 'xmlData'
         * }
         * 
         * - this will define 'method' function as 'captureException' API method 
         * {
         *     methodName: 'captureException',
         *     method: (function (...) {...});
         * }
         * 
         */
        generatePublicAPI: (function () {
            function _generateSetter (variable, namespace, configObj) {
                return function (value) {
                    configObj[namespace][variable] = value;
                };
            }
            
            function _generateGetter (variable, namespace, configObj) {
                return function (value) {
                    return configObj[namespace][variable];
                };
            }
            
            /*
             * publicAPI: array of specifically formated objects
             * configObj: inner configuration object 
             */
            return function (publicAPI, configObj) {
                var _i = 0, _m = null, _capitalized = '',
                    returnObj = {};
                
                for (_i = 0; _i < publicAPI.length; _i += 1) {
                    _m = publicAPI[_i];
                    
                    switch (true) {
                        case (typeof _m.variable !== 'undefined') && (typeof _m.methodName === 'undefined'):
                            _capitalized = Util.capitalizeFirstLetter(_m.variable)
                            returnObj['set' + _capitalized] = _generateSetter(_m.variable, _m.namespace, configObj);
                            returnObj['get' + _capitalized] = _generateGetter(_m.variable, _m.namespace, configObj);
                            
                            break;
                        case (typeof _m.methodName !== 'undefined') && (typeof _m.method !== 'undefined'):
                            returnObj[_m.methodName] = _m.method
                            
                            break;
                        
                        default:                       
                    }
                }
                
                return returnObj;
            };
        } ())
    };

    /*
     * The object to store settings. Allocated from the Global (windows scope) so that users can change settings
     * only through the methods, rather than through a direct change of the object fileds. So that we can to handle
     * change settings event (in setter method).
     */
    Config = {
        xmlData: {
            environment: 'environment'
        },

        options: {
            trackJQ: false, // jQuery.fn.jquery
            host: 'api.airbrake.io',
            errorDefaults: {},
            guessFunctionName: false,
            requestType: 'POST',
            outputFormat: 'XML'
        }
    };
    
    /*
     * The public API definition object. If no 'methodName' and 'method' values specified,
     * getter and setter for 'variable' will be defined.
     */
    _publicAPI = [
        {
            variable: 'environment',
            namespace: 'xmlData'
        }, {
            variable: 'key',
            namespace: 'xmlData'
        }, {
            variable: 'host',
            namespace: 'options'
        }, {
            variable: 'errorDefaults',
            namespace: 'options'
        }, {
            variable: 'guessFunctionName',
            namespace: 'options'
        }, {
            variable: 'requestType',
            namespace: 'options'
        }, {
            variable: 'outputFormat',
            namespace: 'options'
        }, {
            methodName: 'setTrackJQ',
            variable: 'trackJQ',
            namespace: 'options',
            method: (function (value) {
                if (!Util.isjQueryPresent()) {
                    throw Error('Please do not call \'Airbrake.setTrackJQ\' if jQuery does\'t present');
                }
    
                value = !!value;
    
                if (Config.options.trackJQ === value) {
                    return;
                }
    
                Config.options.trackJQ = value;
    
                Util.processjQueryEventHandlerWrapping();
            })
        }, {
            methodName: 'captureException',
            method: (function (e) {
                new Notifier().notify({
                    message: e.message,
                    stack: e.stack
                });
            })
        }
    ];

    // Share to global scope as Airbrake ("window.Hoptoad" for backward compatibility)
    Global = window.Airbrake = window.Hoptoad = Util.generatePublicAPI(_publicAPI, Config);

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

        notify: (function () {
            /*
             * Emit GET request via <iframe> element.
             * Data is transmited as a part of query string.
             */
            function _sendGETRequest (url, data) {
                var request = document.createElement('iframe');
                
                request.style.display = 'none';
                request.src = url + '?data=' + data;
                
                // When request has been sent, delete iframe
                request.onload = function () {
                    // To avoid infinite progress indicator
                    setTimeout(function() {
                        document.body.removeChild(request);
                    }, 0);
                };
    
                document.body.appendChild(request);
            }
            
            /*
             * Cross-domain AJAX POST request. 
             * 
             * It requires a server setup as described in Cross-Origin Resource Sharing spec:
             * http://www.w3.org/TR/cors/
             */
            function _sendPOSTRequest (url, data) {
                var request = new XMLHttpRequest();
                
                request.open('POST', url, true);
                
                request.send(data);
            }
            
            return function (error) {
                var outputData = '',
                    url = 'http://' + this.options.host + '/notifier_api/v2/notices';
                    
                switch (this.options['outputFormat']) {
                    case 'XML':
                        outputData = escape(this.generateXML(error));
                        
                        break;
                    case 'JSON':
                        outputData = escape(this.generateJSON(error));
                        
                        break;
                    default:
                }
                
                switch (this.options['requestType']) {
                    case 'POST':
                        _sendPOSTRequest(url, outputData);
                        break;
                    
                    case 'Get':
                        _sendGETRequest(url, outputData);
                        break;
                    
                    default:
                }
            };
        } ()),
        
        generateJSON: (function () {
            function _generateVariables (inputObj) {
                var key = '', returnArr = [];
                
                for (key in inputObj) {
                    if (inputObj.hasOwnProperty(key)) {
                        returnArr.push({
                            key: key,
                            value: inputObj[key]
                        });
                    }
                }
                
                return returnArr;
            }
            
            function _composeRequestObj (methods, errorObj) {
                var _i = 0,
                    returnObj = {},
                    type = '';
                
                for (_i = 0; _i < methods.length; _i += 1) {
                    type = methods[_i];
                    if (typeof errorObj[type] !== 'undefined') {
                        returnObj[type] = _generateVariables(errorObj[type]);
                    }
                }
                
                return returnObj;             
            }
            
            return function (errorWithoutDefaults) {
                var outputData = this.xmlData,
                    error = Util.merge(this.options.errorDefaults, errorWithoutDefaults),
                    component = error.component || '',
                    methods = ['cgi-data', 'params', 'session'];
                
                outputData.request_url = error.url || '' + location.hash;
                outputData.request_action = error.action || '';
                outputData.request_component = component;
                outputData.request = {};
                
                if (outputData.request_url || component) {
                    error['cgi-data'] = error['cgi-data'] || {};
                    error['cgi-data'].HTTP_USER_AGENT = navigator.userAgent;
                    outputData.request = Util.merge(outputData.request, _composeRequestObj(methods, error));
                }
                
                outputData.project_root = this.ROOT;
                outputData.exception_class = error.type || 'Error';
                outputData.exception_message = error.message || 'Unknown error.';
                
                return JSON.stringify(outputData);
            };
        } ()),

        generateXML: function (errorWithoutDefaults) {
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

        generateBacktrace: function (error) {
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

        getStackTrace: function (error) {
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

        validBacktraceLine: function (line) {
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
