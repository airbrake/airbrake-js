import Notice from '../../src/notice';
import jsonifyNotice from '../../src/jsonify_notice';
import { expect } from './sinon_chai';


describe('jsonify_notice', () => {
    context('when called with notice', () => {
        let obj = {
            params: {arguments: []},
            environment: {env1: 'value1'},
            session: {session1: 'value1'},
        } as Notice;
        let json;

        beforeEach(() => {
            json = jsonifyNotice(obj);
        });

        it('produces valid JSON', () => {
            expect(JSON.parse(json)).to.deep.equal(obj);
        });
    });

    context('when called with huge notice', () => {
        let obj, json, maxLength = 30000;

        beforeEach(() => {
            obj = {
                params: {arr: []},
            };
            for (let i = 0; i < 100; i++) {
                obj.params.arr.push(Array(100).join('x'));
            }
            json = jsonifyNotice(obj, maxLength);
        });

        it('limits json size', () => {
            expect(json.length).to.be.below(maxLength);
        });
    });

    context('when called with one huge string', () => {
        let json, maxLength = 30000;

        beforeEach(() => {
            let obj = {
                params: {str: Array(100000).join('x')},
            } as Notice;
            json = jsonifyNotice(obj, maxLength);
        });

        it('limits json size', () => {
            expect(json.length).to.be.below(maxLength);
        });
    });

    context('when called with huge error message', () => {
        let fn, maxLength = 30000;

        beforeEach(() => {
            let obj = {
                errors: [{
                    message: Array(100000).join('x'),
                }],
            } as Notice;
            fn = () => {
                jsonifyNotice(obj, maxLength);
            };
        });

        it('throws an exception', () => {
            expect(fn).to.throw(
                'airbrake-js: cannot jsonify notice (length=100081 maxLength=30000)');
        });

        it('throws an exception with `json` property', () => {
            try {
                fn();
            } catch (err) {
                expect(err.params.json).to.exist;
            }
        });
    });
});
