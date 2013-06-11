(function() {

var Global = ("undefined" === typeof GLOBAL) ? this : GLOBAL;

var make_xml_http_request = function(url, data) {
  var request = new Global.XMLHttpRequest();
  request.open('POST', url, true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(data);
};

var make_mock_xml_http_request = function(url, data) {
  // console.log(data);
};

var airbrake_client_app_protocol = (Global.location ? Global.location.protocol : '[app_protocol]'),
    airbrake_client_app_location = (Global.location ? Global.location.protocol + '//' + Global.location.host : '[app_url]'),
    airbrake_client_app_hostname = (Global.location ? Global.location.hostname : '[app_hostname]'),
    airbrake_client_app_hash = (Global.location ? Global.location.hash : '[app_hash]'),
    airbrake_client_app_navigator_user_agent = (Global.navigator ? Global.navigator.userAgent : '[app_navigator_user_agent]'),
    airbrake_client_app_href = (Global.document ? Global.document.location.href : '[app_doc_location_href]'),
    airbrake_client_app_create_xml_http_request = (Global.XMLHttpRequest ? make_xml_http_request : make_mock_xml_http_request);

// Airbrake JavaScript Notifier Bundle
(function(window, document, airbrake_client_app_protocol, airbrake_client_app_location, airbrake_client_app_hostname, airbrake_client_app_hash, airbrake_client_app_navigator_user_agent, airbrake_client_app_href, airbrake_client_app_create_xml_http_request, undefined) {
