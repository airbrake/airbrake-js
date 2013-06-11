/* jshint -W084, -W030, -W014, -W033, -W099, -W069, -W064, -W067 */

// Import utils
var merge = require("./util/merge"),
    sub = require("./util/substitute");

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
  REQUEST_VARIABLE_GROUP_XML = '<{group_name}>{inner_content}</{group_name}>',
  REQUEST_VARIABLE_XML = '<var key="{key}">{value}</var>',
  BACKTRACE_LINE_XML = '<line method="{function}" file="{file}" number="{line}" />',
  Config,
  Global,
  Util,
  _publicAPI,

Util = {
  /*
   * Add hook for jQuery.fn.on function, to manualy call window.Airbrake.captureException() method
   * for every exception occurred.
   *
   * Let function 'f' be binded as an event handler:
   *
   * $(window).on 'click', f
   *
   * If an exception is occurred inside f's body, it will be catched here
   * and forwarded to captureException method.
   *
   * processjQueryEventHandlerWrapping is called every time window.Airbrake.setTrackJQ method is used,
   * if it switches previously setted value.
   */
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

        // Call original jQuery.fn.on, with the same list of arguments, but
        // a function replaced with a proxy.
        return Config.jQuery_fn_on_original.apply(this, args);
      };
    } else {
      // Recover original jQuery.fn.on if Config.options.trackJQ is set to false
      (typeof Config.jQuery_fn_on_original === 'function') && (jQuery.fn.on = Config.jQuery_fn_on_original);
    }
  },

  isjQueryPresent: function () {
    // Currently only 1.7.x version supported
    return (typeof jQuery === 'function') && ('fn' in jQuery) && ('jquery' in jQuery.fn)
        && (jQuery.fn.jquery.indexOf('1.7') === 0)
  },

  /*
   * Generate public API from an array of specifically formated objects, e.g.
   *
   * - this will generate 'setEnvironment' and 'getEnvironment' API methods for configObj.xmlData.environment variable:
   * {
   *   variable: 'environment',
   *   namespace: 'xmlData'
   * }
   *
   * - this will define 'method' function as 'captureException' API method
   * {
   *   methodName: 'captureException',
   *   method: (function (...) {...});
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

    // Make first letter in a string capital. e.g. 'guessFunctionName' -> 'GuessFunctionName'
    // Is used to generate getter and setter method names.
    function _capitalizeFirstLetter (str) {
      return str[0].toUpperCase() + str.slice(1);
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
            _capitalized = _capitalizeFirstLetter(_m.variable)
            returnObj['set' + _capitalized] = _generateSetter(_m.variable, _m.namespace, configObj);
            returnObj['get' + _capitalized] = _generateGetter(_m.variable, _m.namespace, configObj);

            break;
          case (typeof _m.methodName !== 'undefined') && (typeof _m.method !== 'undefined'):
            returnObj[_m.methodName] = _m.method;

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
    requestType: 'GET', // Can be 'POST' or 'GET'
    outputFormat: 'XML' // Can be 'XML' or 'JSON'
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
  },{
    variable: 'projectId',
    namespace: 'options'
  },{
    variable: 'errorDefaults',
    namespace: 'options'
  }, {
    variable: 'guessFunctionName',
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
  this.options = merge({}, Config.options);
  this.xmlData = merge(this.DEF_XML_DATA, Config.xmlData);
}

Notifier.prototype = {
  constructor: Notifier,
  VERSION: '0.2.0',
  ROOT: airbrake_client_app_location,
  BACKTRACE_MATCHER: /^(.*)\@(.*)\:(\d+)$/,
  backtrace_filters: [/airbrake-js\.js/],
  DEF_XML_DATA: {
    request: {}
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

    return function (error) {
      var outputData = '',
        url =  '';
        //

         /*
        * Should be changed to url = '//' + ...
        * to use the protocol of current page (http or https). Only sends 'secure' if page is secure.
        * XML uses V2 API. http://collect.airbrake.io/notifier_api/v2/notices
         */


      if (this.options['outputFormat'] === 'XML' || this.options['outputFormat'] === 'JSON') {
        outputData = this.generateDataJSON(error);
      }

      switch (this.options['outputFormat']) {
        case 'XML':
           url = ('https:' == airbrake_client_app_protocol ? 'https://' : 'http://') + this.options.host + '/notifier_api/v2/notices';
          _sendGETRequest(url, escape(this.generateXML(outputData)));
           break;

        case 'JSON':
          // JSON uses API V3. Needs project in URL.
          //   http://collect.airbrake.io/api/v3/projects/[PROJECT_ID]/notices?key=[API_KEY]
          //   url = window.location.protocol + '://' + this.options.host + '/api/v3/projects' + this.options.projectId + '/notices?key=' + this.options.key;
          url = ('https:' == airbrake_client_app_protocol ? 'https://' : 'http://') + this.options.host + '/api/v3/projects/' + this.options.projectId + '/notices?key=' + this.xmlData.key;

          airbrake_client_app_create_xml_http_request(url, JSON.stringify(airbrake_client_app_formatter.format(outputData)));
          break;

        default:
      }

    };
  } ()),

  /*
   * Generate inner JSON representation of exception data that can be rendered as XML or JSON.
   */
  generateDataJSON: (function () {
    /*
     * Generate variables array for inputObj object.
     *
     * e.g.
     *
     * _generateVariables({a: 'a'}) -> [{key: 'a', value: 'a'}]
     *
     */
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

    /*
     * Generate Request part of notification.
     */
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
        /*
         * A constructor line:
         *
         * this.xmlData = merge(this.DEF_XML_DATA, Config.xmlData);
         */
      var outputData = this.xmlData,
        error = merge(this.options.errorDefaults, errorWithoutDefaults),

        component = error.component || '',
        request_url = (error.url || '' + airbrake_client_app_hash),

        methods = ['cgi-data', 'params', 'session'],
        _outputData = null;

      _outputData = {
        request_url: request_url,
        request_action: (error.action || ''),
        request_component: component,
        request: (function () {
          if (request_url || component) {
            error['cgi-data'] = error['cgi-data'] || {};
            error['cgi-data'].HTTP_USER_AGENT = airbrake_client_app_navigator_user_agent;
            return merge(outputData.request, _composeRequestObj(methods, error));
          } else {
            return {};
          }
        } ()),

        project_root: this.ROOT,
        exception_class: (error.type || 'Error'),
        exception_message: (error.message || 'Unknown error.'),
        backtrace_lines: this.generateBacktrace(error)
      };

      outputData = merge(outputData, _outputData);

      return outputData;
    };
  } ()),

  /*
   * Generate XML notification from inner JSON representation.
   * NOTICE_XML is used as pattern.
   */
  generateXML: (function () {
    function _generateRequestVariableGroups (requestObj) {
      var _group = '',
        returnStr = '';

      for (_group in requestObj) {
        if (requestObj.hasOwnProperty(_group)) {
          returnStr += sub.substitute(REQUEST_VARIABLE_GROUP_XML, {
            group_name: _group,
            inner_content: sub.substituteArr(REQUEST_VARIABLE_XML, requestObj[_group], true)
          }, true);
        }
      }

      return returnStr;
    }

    return function (JSONdataObj) {
      JSONdataObj.request = _generateRequestVariableGroups(JSONdataObj.request);
      JSONdataObj.backtrace_lines = sub.substituteArr(BACKTRACE_LINE_XML, JSONdataObj.backtrace_lines, true);

      return sub.substitute(NOTICE_XML, JSONdataObj, true);
    };
  } ()),

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

        if (i === 0 && matches[2].match(airbrake_client_app_href)) {
          // backtrace.push('<line method="" file="internal: " number=""/>');

          backtrace.push({
          // Updated to fit in with V3 new terms for Backtrace data.
            'function': '',
            file: 'internal: ',
            line: ''
          });
        }

        backtrace.push({
          'function': matches[1],
          file: file,
          line: matches[3]
        });
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
