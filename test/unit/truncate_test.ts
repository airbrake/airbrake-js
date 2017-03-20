import { truncate } from '../../src/jsonify_notice';
import { expect } from './sinon_chai';


describe('truncate', () => {
    it('works', () => {
        let tests = [
            [undefined],
            [null],
            [true],
            [false],
            [new Boolean(true)],
            [1],
            [3.14],
            [new Number(1)],
            [Infinity],
            [NaN],
            [Math.LN2],
            ['hello'],
            [new String('hello'), 'hello'],
            [['foo', 'bar']],
            [{'foo': 'bar'}],
            [new Date()],
            [/a/],
            [new RegExp('a')],
            [new Error('hello'), 'Error: hello'],
        ];
        for (let test of tests) {
            let wanted = test.length >= 2 ? test[1] : test[0];
            if (isNaN(wanted as any)) {
                continue;
            }
            expect(truncate(test[0])).to.equal(wanted);
        }
    });

    it('omits functions in object', () => {
        let obj = {
            foo: 'bar',
            fn1: Math.sin,
            fn2: () => null,
            fn3: new Function('x', 'y', 'return x * y'),
        };

        expect(truncate(obj)).to.deep.equal({foo: 'bar'});
    });

    it('sets object type', () => {
        let e = new Event('load');

        let got = truncate(e);
        expect(got.__type).to.equal('Event');
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
            truncated = truncate(obj, 1);
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
                            'obj': '[Truncated Object]',
                        },
                    },
                },
            });
        });
    });
});
