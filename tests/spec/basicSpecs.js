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

describe("JSON data format tests.", function () {
    var _dataObj = null;
    
    window.Airbrake.setOutputFormat('JSON');
    
    beforeEach(function() {
        spyOn(window.XMLHttpRequest.prototype, 'open').andCallFake(function() {
            
        });
        
        spyOn(window.XMLHttpRequest.prototype, 'send').andCallFake(function() {
            
        });
        
        try {
            (0)();
        } catch (e) {
            window.Airbrake.captureException(e);
            
            _dataObj = JSON.parse(window.XMLHttpRequest.prototype.send.mostRecentCall.args[0]);
        }
    });
    
    it('Should contain \'api-key\' ', function() {
        expect(_dataObj['api-key']).toBe(window.Airbrake.getKey());
    });
    
    it('Should contain \'error\' ', function() {
        expect(typeof _dataObj.error).not.toBe('undefined');
    });
    
    it('Should contain \'notifier\' ', function() {
        expect(typeof _dataObj.notifier).not.toBe('undefined');
    });
    
    it('Should contain \'request\' ', function() {
        expect(typeof _dataObj.request).not.toBe('undefined');
    });
    
    it('Should contain \'server-environment\' ', function() {
        expect(typeof _dataObj['server-environment']).not.toBe('undefined');
    });
    
    it('Should contain \'version\' ', function() {
        expect(typeof _dataObj['version']).not.toBe('undefined');
    });
});