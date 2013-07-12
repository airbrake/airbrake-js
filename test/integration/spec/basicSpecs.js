window.Airbrake.setKey('111');

describe("Global objects.", function () {
    it("Global variable defined: window.Airbrake.", function() {
        expect(window.Airbrake).not.toBe(null);
        expect( typeof window.Airbrake).toBe('object');
    });
});

describe("Public interface.", function () {
    var _methods = ['setEnvironment', 'setKey', 'setHost', 'setErrorDefaults', 'setGuessFunctionName', 'setTrackJQ', 'captureException'],
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
    var _dataObj = null,
        _openMethod = null,
        _openUrl = null;

    window.Airbrake.setOutputFormat('JSON');

    beforeEach(function() {
        spyOn(window.XMLHttpRequest.prototype, 'open').andCallFake(function() {

        });

        spyOn(window.XMLHttpRequest.prototype, 'setRequestHeader').andCallFake(function() {

        });

        spyOn(window.XMLHttpRequest.prototype, 'send').andCallFake(function() {

        });

        try {
            (0)();
        } catch (e) {
            window.Airbrake.captureException(e);

            _dataObj = JSON.parse(window.XMLHttpRequest.prototype.send.mostRecentCall.args[0]);
            _openMethod = window.XMLHttpRequest.prototype.open.mostRecentCall.args[0];
            _openUrl = window.XMLHttpRequest.prototype.open.mostRecentCall.args[1];
        }
    });

    it('Should use \'api-key\' in url', function() {
        expect(_openUrl).toMatch(new RegExp("key=" + window.Airbrake.getKey()));
    });

    it('Should contain \'errors\' ', function() {
        expect(typeof _dataObj.errors).not.toBe('undefined');
        expect(_dataObj.errors.length).toEqual(1);
        expect(typeof _dataObj.errors[0].type).not.toBe('undefined');
        expect(typeof _dataObj.errors[0].message).not.toBe('undefined');
        expect(typeof _dataObj.errors[0].backtrace.length).not.toBe('undefined');
        expect(typeof _dataObj.errors[0].backtrace[0].file).toBe('string');
        expect(typeof _dataObj.errors[0].backtrace[0]['function']).toBe('string');
        expect(typeof _dataObj.errors[0].backtrace[0].line).toBe('number');
    });

    it('Should contain \'notifier\' ', function() {
        expect(typeof _dataObj.notifier).not.toBe('undefined');
    });

    it('Should contain \'environment\' in context', function() {
        expect(typeof _dataObj['context']).not.toBe('undefined');
        expect(typeof _dataObj['context']['environment']).not.toBe('undefined');
    });

});