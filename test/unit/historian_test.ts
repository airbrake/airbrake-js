import Client = require('../../src/client');
import { expect } from './sinon_chai';


describe('instrumentation', function() {
    let processor, reporter, client;

    beforeEach(function() {
        processor = sinon.spy((data, cb) => {
            cb('test-processor', data);
        });
        reporter = sinon.spy((_notice, _opts, promise) => {
            promise.resolve({id: 1});
        });
        client = new Client({processor: processor, reporter: reporter});
    });

    describe('location', function() {
        beforeEach(function() {
            let locations = ['', 'http://hello/world', 'foo', '/'];
            for (let loc of locations) {
                try {
                    window.history.pushState(null, '', loc);
                } catch (_) {}
            }
            client.notify(new Error('test'));
        });

        it('records browser history', function() {
            expect(reporter).to.have.been.called;
            let notice = reporter.lastCall.args[0];
            let history = notice.context.history;
            expect(history.length).to.equal(10);

            let state = history[7];
            delete state.date;
            expect(state).to.deep.equal({
                type: 'location',
                from: '/context.html',
                to: '/world',
            });

            state = history[8];
            delete state.date;
            expect(state).to.deep.equal({
                type: 'location',
                from: '/world',
                to: '/foo',
            });

            state = history[9];
            delete state.date;
            expect(state).to.deep.equal({
                type: 'location',
                from: '/foo',
                to: '/',
            });
        });
    });

    describe('XHR', function() {
        beforeEach(function() {
            let req = new XMLHttpRequest();
            req.open('GET', 'https://google.com/', false);
            try {
                req.send();
            } catch (_) {};
            client.notify(new Error('test'));
        });

        it('records request', function() {
            expect(reporter).to.have.been.called;
            let notice = reporter.lastCall.args[0];
            let history = notice.context.history;
            expect(history.length).to.equal(10);

            let state = history[9];
            delete state.date;
            expect(state.type).to.equal('xhr');
            expect(state.method).to.equal('GET');
            expect(state.url).to.equal('https://google.com/');
            expect(state.statusCode).to.equal(0);
            expect(state.duration).to.be.a('number');
        });
    });
});
