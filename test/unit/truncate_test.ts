import { truncate } from '../../src/jsonify_notice';
import { expect } from './sinon_chai';


describe('truncate', () => {
    context('when called with plain object', () => {
        let obj = {
            null: null,
            bool: true,
            boolObj: new Boolean(true),
            int: 1,
            float: 3.14,
            numberObj: new Number(1),
            infinity: Infinity,
            nan: NaN,
            ln2: Math.LN2,
            str: 'hello world',
            strObj: new String('hello world'),
            arr: ['foo', 'bar'],
            obj: {'foo': 'bar'},
            date: new Date(),
            func: Math.sin,
            func2: new Function('x', 'y', 'return x * y'),
            re: /a/,
            re2: new RegExp('a'),
        };
        let truncated;

        beforeEach(() => {
            truncated = truncate(obj);
        });

        it('produces same object', () => {
            expect(truncated).to.deep.equal(obj);
        });
    });

    it('returns Error.toString()', () => {
        let truncated = truncate(new Error('hello'));
        expect(truncated).to.equal('Error: hello');
    });

    context('when called with object with circular references', () => {
        let obj: any = {foo: 'bar'};
        obj.circularRef = obj;
        obj.circularList = [obj, obj];
        let truncated;

        beforeEach(() => {
            truncated = truncate(obj);
        });

        it('produces object with resolved circular references', () => {
            expect(truncated).to.deep.equal({
                'foo': 'bar',
                'circularRef': '[Circular ~]',
                'circularList': ['[Circular ~]', '[Circular ~]'],
            });
        });
    });

    context('when called with object with complex circular references', () => {
        let a: any = {x: 1};
        a.a = a;
        let b: any = {x: 2};
        b.a = a;
        let c = {a: a, b: b};

        let obj: any = {list: [a, b, c]};
        obj.obj = obj;

        let truncated;

        beforeEach(() => {
            truncated = truncate(obj);
        });

        it('produces object with resolved circular references', () => {
            expect(truncated).to.deep.equal({
                'list': [{
                    'x': 1,
                    'a': '[Circular ~.list.0]'
                }, {
                    'x': 2,
                    'a': '[Circular ~.list.0]'
                }, {
                    'a': '[Circular ~.list.0]',
                    'b': '[Circular ~.list.1]'
                }],
                'obj': '[Circular ~]'
            });
        });
    });

    context('when called with deeply nested objects', () => {
        let obj = {};
        let tmp: any = obj;
        for (let i = 0; i < 100; i++) {
            tmp.value = i;
            tmp.obj = {};
            tmp = tmp.obj;
        }

        let truncated;

        beforeEach(() => {
            truncated = truncate(obj);
        });

        it('produces truncated object', () => {
            expect(truncated).to.deep.equal({
                'value': 0,
                'obj': {
                    'value': 1,
                    'obj': {
                        'value': 2,
                        'obj': {
                            'value': 3,
                            'obj': {
                                'value': 4,
                                'obj': '[Truncated]'
                            }
                        }
                    }
                }
            });
        });
    });

    context('when called with n=0', () => {
        let truncated;

        beforeEach(() => {
            truncated = truncate({foo: 'bar'}, 0);
        });

        it('produces [Truncated]', () => {
            expect(truncated).to.equal('[Truncated]');
        });
    });
});
