import Client = require('../../src/client');
import { expect } from './sinon_chai';


describe('location instrumentation', () => {
    let processor, reporter, client;

    beforeEach(() => {
        processor = sinon.spy((data, cb) => {
            cb('test-processor', data);
        });
        reporter = sinon.spy((_notice, _opts, promise) => {
            promise.resolve({id: 1});
        });
        client = new Client({processor: processor, reporter: reporter});
    });

    it('instruments history', () => {
        let locations = ['', 'http://hello/world', 'foo', '/'];
        for (let loc of locations) {
            try {
                window.history.pushState(null, '', loc);
            } catch (_) {}
        }
        client.notify(new Error('test'));

        expect(reporter).to.have.been.called;
        let notice = reporter.lastCall.args[0];
        let history = notice.context.history;
        expect(history).to.have.length(3);

        let state = history[0];
        delete state.date;
        expect(state).to.deep.equal({
            type: 'location',
            from: '/context.html',
            to: '/world',
        });

        state = history[1];
        delete state.date;
        expect(state).to.deep.equal({
            type: 'location',
            from: '/world',
            to: '/foo',
        });

        state = history[2];
        delete state.date;
        expect(state).to.deep.equal({
            type: 'location',
            from: '/foo',
            to: '/',
        });
    });
});
