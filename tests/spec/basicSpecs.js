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