import {NoticeError} from '../../../src/notice';
import processor from '../../../src/processor/stacktracejs';

import { expect } from '../sinon_chai';


describe('stacktracejs processor', () => {
    let error: NoticeError;

    describe('Error', () => {
        beforeEach(() => {
            try {
                throw new Error('BOOM');
            } catch (err) {
                error = processor(err);
            }
        });

        it('provides type and message', () => {
            expect(error.type).to.equal('Error');
            expect(error.message).to.equal('BOOM');
        });

        it('provides backtrace', () => {
            let backtrace = error.backtrace;
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
            let err: any;
            err = 'BOOM';

            error = processor(err as Error);
        });

        it('uses text as error message', () => {
            expect(error.type).to.equal('');
            expect(error.message).to.equal('BOOM');
        });

        it('provides backtrace', () => {
            let backtrace = error.backtrace;
            expect(backtrace.length).to.equal(5);
        });
    });
});
