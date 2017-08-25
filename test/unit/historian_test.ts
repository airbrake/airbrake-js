import Client = require('../../src/client');
import * as sinon from 'sinon';
import { expect } from './sinon_chai';


class Location {
    private s: string;

    constructor(s: string) {
        this.s = s;
    }

    toString(): string {
        return this.s;
    }
}

describe('instrumentation', () => {
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

    describe('location', () => {
        beforeEach(() => {
            let locations = [
                '',
                'http://hello/world',
                'foo',
                new Location('/'),
            ];
            for (let loc of locations) {
                try {
                    window.history.pushState(null, '', loc as string);
                } catch (_) {}
            }
            client.notify(new Error('test'));
        });

        it('records browser history', () => {
            expect(reporter).to.have.been.called;
            let notice = reporter.lastCall.args[0];
            let history = notice.context.history;

            let state = history[history.length - 3];
            delete state.date;
            expect(state).to.deep.equal({
                type: 'location',
                from: '/context.html',
                to: '/world',
            });

            state = history[history.length - 2];
            delete state.date;
            expect(state).to.deep.equal({
                type: 'location',
                from: '/world',
                to: '/foo',
            });

            state = history[history.length - 1];
            delete state.date;
            expect(state).to.deep.equal({
                type: 'location',
                from: '/foo',
                to: '/',
            });
        });
    });

    describe('XHR', () => {
        beforeEach(() => {
            let req = new XMLHttpRequest();
            req.open('GET', 'http://ip2c.org/self', false);
            req.send();
            client.notify(new Error('test'));
        });

        it('records request', () => {
            expect(reporter).to.have.been.called;
            let notice = reporter.lastCall.args[0];
            let history = notice.context.history;

            let state = history[history.length - 1];
            expect(state.type).to.equal('xhr');
            expect(state.method).to.equal('GET');
            expect(state.url).to.equal('http://ip2c.org/self');
            expect(state.statusCode).to.equal(200);
            expect(state.duration).to.be.a('number');
        });
    });

    describe('fetch', () => {
        beforeEach(() => {
            let promise = fetch('http://ip2c.org/4.4.4.4');
            promise.then(() => {
                client.notify(new Error('test'));
            });
            return promise;
        });

        it('records request', () => {
            expect(reporter).to.have.been.called;
            let notice = reporter.lastCall.args[0];
            let history = notice.context.history;

            let state = history[history.length - 1];
            expect(state.type).to.equal('xhr');
            expect(state.method).to.equal('GET');
            expect(state.url).to.equal('http://ip2c.org/4.4.4.4');
            expect(state.statusCode).to.equal(200);
            expect(state.duration).to.be.a('number');
        });
    });

    describe('console', () => {
        beforeEach(() => {
            for (let i = 0; i < 25; i++) {
                console.log(i);
            }
            client.notify(new Error('test'));
        });

        it('records log message', () => {
            expect(reporter).to.have.been.called;
            let notice = reporter.lastCall.args[0];
            let history = notice.context.history;
            expect(history).to.have.length(20);

            for (let i in history) {
                let state = history[i];
                expect(state.type).to.equal('log');
                expect(state.severity).to.equal('log');
                expect(state.arguments).to.deep.equal([+i + 5]);
                expect(state.date).to.exist;
            }
        });
    });
});
