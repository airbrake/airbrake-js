import Notice from '../../src/notice';
import jsonifyNotice from '../../src/jsonify_notice';
import { expect } from './sinon_chai';


describe('jsonify_notice', () => {
    const maxLength = 30000;

    context('when called with notice', () => {
        let notice = {
            params: {arguments: []},
            environment: {env1: 'value1'},
            session: {session1: 'value1'},
        };
        let json;

        beforeEach(() => {
            json = jsonifyNotice(notice as Notice);
        });

        it('produces valid JSON', () => {
            expect(JSON.parse(json)).to.deep.equal(notice);
        });
    });

    context('when called with huge notice', () => {
        let json;

        beforeEach(() => {
            let notice = {
                params: {arr: []},
            };
            for (let i = 0; i < 100; i++) {
                notice.params.arr.push(Array(100).join('x'));
            }
            json = jsonifyNotice(notice as Notice, {maxLength});
        });

        it('limits json size', () => {
            expect(json.length).to.be.below(maxLength);
        });
    });

    context('when called with one huge string', () => {
        let json;

        beforeEach(() => {
            let notice = {
                params: {str: Array(100000).join('x')},
            };
            json = jsonifyNotice(notice as Notice, {maxLength});
        });

        it('limits json size', () => {
            expect(json.length).to.be.below(maxLength);
        });
    });

    context('when called with huge error message', () => {
        let json;

        beforeEach(() => {
            let notice = {
                errors: [{
                    type: Array(100000).join('x'),
                    message: Array(100000).join('x'),
                }],
            } ;
            json = jsonifyNotice(notice as Notice, {maxLength});
        });

        it('limits json size', () => {
            expect(json.length).to.be.below(maxLength);
        });
    });
});
