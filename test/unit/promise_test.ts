import Promise from '../../src/promise';
import * as sinon from 'sinon';
import { expect } from './sinon_chai';


describe('Promise', () => {
    let promise, resolve, onResolved, reject, onRejected;

    beforeEach(() => {
        let executor = (_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        };
        onResolved = sinon.spy();
        onRejected = sinon.spy();
        promise = new Promise(executor).then(onResolved, onRejected);
    });

    it('calls onResolved when resolved', () => {
        expect(onResolved).to.not.have.been.called;
        resolve(['hello', 'world']);
        expect(onResolved).to.have.been.called;
        expect(onResolved.lastCall.args).to.deep.equal([['hello', 'world']]);
    });

    it('calls onRejected when rejected', () => {
        expect(onRejected).to.not.have.been.called;
        reject('reason');
        expect(onRejected).to.have.been.called;
        expect(onRejected.lastCall.args).to.deep.equal(['reason']);
    });

    it('calls onResolved when binded after resolve', () => {
        resolve('hello', 'world');
        onResolved = sinon.spy();
        promise.then(onResolved);
        expect(onResolved).to.have.been.called;
    });
});
