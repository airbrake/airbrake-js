describe("Performance testing.", function () {
  var _i = 0,
    _XMLHttpRequest = window.XMLHttpRequest,
    _callsNumber = 10,
    _recCallsLevel = 10;

  window.Airbrake.setOutputFormat('JSON');

  beforeEach(function() {
    spyOn(window.XMLHttpRequest.prototype, 'open').andCallFake(function() {

    });

    spyOn(window.XMLHttpRequest.prototype, 'setRequestHeader').andCallFake(function() {

    });

    spyOn(window.XMLHttpRequest.prototype, 'send').andCallFake(function() {

    });
  });

  it(_callsNumber + " exceptions", function () {
    for (_i = 0; _i < _callsNumber; _i += 1) {
      try {
        (0)();
      } catch (e) {
        window.Airbrake.push(e);
      }
    }

    expect(window.XMLHttpRequest.prototype.open).toHaveBeenCalled();
    expect(window.XMLHttpRequest.prototype.send).toHaveBeenCalled();

    expect(window.XMLHttpRequest.prototype.open.calls.length).toEqual(_callsNumber);
    expect(window.XMLHttpRequest.prototype.send.calls.length).toEqual(_callsNumber);
  });

  it(_callsNumber + " deeply nested exception", function () {
    var _funcRec = function (level) {
      if (level === 0) {
        (0)();
      } else {
        _funcRec(level - 1);
      }
    };

    for (_i = 0; _i < _callsNumber; _i += 1) {
      try {
        _funcRec(_recCallsLevel);
      } catch (e) {
        window.Airbrake.push(e);
      }
    }

    expect(window.XMLHttpRequest.prototype.open).toHaveBeenCalled();
    expect(window.XMLHttpRequest.prototype.send).toHaveBeenCalled();

    expect(window.XMLHttpRequest.prototype.open.calls.length).toEqual(_callsNumber);
    expect(window.XMLHttpRequest.prototype.send.calls.length).toEqual(_callsNumber);
  });
});
