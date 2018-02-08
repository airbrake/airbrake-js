import Promise from '../../src/promise';
import * as sinon from 'sinon';
import { expect } from './sinon_chai';


describe('Promise', () => {
    let promise, resolve, onResolved, reject, onRejected, onFinally;

    beforeEach(() => {
        let executor = (_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        };
        onResolved = sinon.spy();
        onRejected = sinon.spy();
        onFinally = sinon.spy();
        promise = new Promise(executor).
            then(onResolved, onRejected).
            finally(onFinally);
    });

    let assert = () => {
        it('calls onResolved and onFinally when resolved', () => {
            expect(onResolved).to.not.have.been.called;
            resolve(['hello', 'world']);
            expect(onResolved).to.have.been.called;
            expect(onResolved.lastCall.args).to.deep.equal([['hello', 'world']]);
            expect(onFinally).to.have.been.called;
        });

        it('calls onRejected and onFinally when rejected', () => {
            expect(onRejected).to.not.have.been.called;
            reject('reason');
            expect(onRejected).to.have.been.called;
            expect(onRejected.lastCall.args).to.deep.equal(['reason']);
            expect(onFinally).to.have.been.called;
        });

        it('calls onResolved and onFinally when binded after resolve', () => {
            resolve('hello', 'world');
            onResolved = sinon.spy();
            promise.then(onResolved);
            expect(onResolved).to.have.been.called;
            expect(onFinally).to.have.been.called;
        });

        it('calls onRejected and onFinally when binded after reject', () => {
            reject('reason');
            onRejected = sinon.spy();
            promise.catch(onRejected);
            expect(onRejected).to.have.been.called;
            expect(onFinally).to.have.been.called;
        });
    };

    assert();

    describe('Promise.all', () => {
        beforeEach(() => {
            promise = Promise.all([promise]);
        });

        assert();
    });
});
