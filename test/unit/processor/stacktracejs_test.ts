import processor from '../../../src/processor/stacktracejs';
import * as sinon from 'sinon';
import { expect } from '../sinon_chai';


describe('stacktracejs processor', () => {
    let cb;

    describe('Error', () => {
        beforeEach(() => {
            cb = sinon.spy();
            try {
                throw new Error('BOOM');
            } catch (err) {
                processor(err, cb);
            }
        });

        it('calls callback', () => {
            expect(cb).to.have.been.called;
        });

        it('provides processor name', () => {
            let name = cb.lastCall.args[0];
            expect(name).to.equal('stacktracejs');
        });

        it('provides type and message', () => {
            let type = cb.lastCall.args[1].type;
            expect(type).to.equal('Error');

            let msg = cb.lastCall.args[1].message;
            expect(msg).to.equal('BOOM');
        });

        it('provides backtrace', () => {
            let backtrace = cb.lastCall.args[1].backtrace;
            expect(backtrace.length).to.equal(6);

            let frame = backtrace[0];
            expect(frame.file).to.contain('test/unit/processor/stacktracejs_test.ts');
            expect(frame.function).to.equal('Context.<anonymous>');
            expect(frame.line).to.be.a('number');
            expect(frame.column).to.be.a('number');
        });
    });

    describe('text', () => {
        beforeEach(() => {
            cb = sinon.spy();

            let err: any;
            err = 'BOOM';

            processor(err as Error, cb);
        });

        it('calls callback', () => {
            expect(cb).to.have.been.called;
        });

        it('uses text as error message', () => {
            let type = cb.lastCall.args[1].type;
            expect(type).to.equal('');

            let msg = cb.lastCall.args[1].message;
            expect(msg).to.equal('BOOM');
        });

        it('provides backtrace', () => {
            let backtrace = cb.lastCall.args[1].backtrace;
            expect(backtrace.length).to.equal(5);
        });
    });
});
