(function() {

var JSONFormatter = require("./formatters/json_formatter");

var make_xml_http_request = function(url, data) {
  var request = new global.XMLHttpRequest();
  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(data);
};

var make_mock_xml_http_request = function(url, data) {
  // console.log(data);
};

var airbrake_client_app_protocol = (global.location ? global.location.protocol : '[app_protocol]'),
    airbrake_client_app_location = (global.location ? global.location.protocol + '//' + global.location.host : '[app_location]'),
    airbrake_client_app_hostname = (global.location ? global.location.hostname : '[app_hostname]'),
    airbrake_client_app_hash = (global.location ? global.location.hash : '[app_hash]'),
    airbrake_client_app_navigator_user_agent = (global.navigator ? global.navigator.userAgent : '[app_navigator_user_agent]'),
    airbrake_client_app_href = (global.document ? global.document.location.href : '[app_doc_location_href]'),
    airbrake_client_app_create_xml_http_request = (global.XMLHttpRequest ? make_xml_http_request : make_mock_xml_http_request),
    airbrake_client_app_formatter = new JSONFormatter();

// Airbrake JavaScript Notifier Bundle
(function(window, document, airbrake_client_app_protocol, airbrake_client_app_location, airbrake_client_app_hostname, airbrake_client_app_hash, airbrake_client_app_navigator_user_agent, airbrake_client_app_href, airbrake_client_app_create_xml_http_request, airbrake_client_app_formatter, undefined) {
