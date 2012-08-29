window.Airbrake.setKey('111');

describe("Global objects.", function () {
    it("Global variable defined: window.Airbrake.", function() {
        expect(window.Airbrake).not.toBe(null);
        expect( typeof window.Airbrake).toBe('object');
    });

    it("Global variable defined: window.Hoptoad.", function() {
        expect(window.Hoptoad).not.toBe(null);
        expect( typeof window.Hoptoad).toBe('object');
    });

    it("window.Airbrake and window.Hoptoad are the same object.", function() {
        expect(window.Hoptoad).toBe(window.Airbrake);
    });
});

describe("Public interface.", function () {
    var _methods = ['setRequestType', 'setEnvironment', 'setKey', 'setHost', 'setErrorDefaults', 'setGuessFunctionName', 'setTrackJQ', 'captureException'],
        _i = 0;

    function _createMathodSpec (methodName) {
        it("Method defined: window.Airbrake." + methodName, function() {
            expect(window.Airbrake[methodName]).not.toBe(null);
            expect(typeof window.Airbrake[methodName]).toBe('function');
        });
    }
    
    for (_i = 0; _i < _methods.length; _i += 1) {
        _createMathodSpec(_methods[_i]);
    }
});


describe("Performance testing.", function () {
    var _i = 0,
        _XMLHttpRequest = window.XMLHttpRequest,
        _callsNumber = 1000,
        _recCallsLevel = 10000;
    
    window.Airbrake.setRequestType('POST');
    
    beforeEach(function() {
        spyOn(window.XMLHttpRequest.prototype, 'open').andCallFake(function() {
            
        });
        
        spyOn(window.XMLHttpRequest.prototype, 'send').andCallFake(function() {
            
        });
    });
    
    it(_callsNumber + " exceptions", function () {
        for (_i = 0; _i < _callsNumber; _i += 1) {
            try {
                (0)();
            } catch (e) {
                window.Airbrake.captureException(e);
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
                window.Airbrake.captureException(e);
            }
        }
        
        expect(window.XMLHttpRequest.prototype.open).toHaveBeenCalled();
        expect(window.XMLHttpRequest.prototype.send).toHaveBeenCalled();
        
        expect(window.XMLHttpRequest.prototype.open.calls.length).toEqual(_callsNumber);
        expect(window.XMLHttpRequest.prototype.send.calls.length).toEqual(_callsNumber);
    });
});
