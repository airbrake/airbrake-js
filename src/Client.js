// The Client is the entry point to interacting with the Airbrake JS library.
// It stores configuration information and dispatches errors.
// window.Airbrake is an instance of Client.
function Client() {
  var _environment;
  this.setEnvironment = function(val) { _environment = val; };
  this.getEnvironment = function() { return _environment; };

  var _key;
  this.setKey = function(val) { _key = val; };
  this.getKey = function() { return _key; };

  var _host;
  this.setHost = function(val) { _host = val; };
  this.getHost = function() { return _host; };

  var _errorDefaults;
  this.setErrorDefaults = function(val) { _errorDefaults = val; };
  this.getErrorDefaults = function() { return _errorDefaults; };

  var _guessFunctionName = false;
  this.setGuessFunctionName = function(val) { _guessFunctionName = val; };
  this.getGuessFunctionName = function() { return _guessFunctionName; };
}

module.exports = Client;
