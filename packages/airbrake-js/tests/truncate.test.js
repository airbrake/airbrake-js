import { truncate } from '../src/jsonify_notice';

describe('truncate', () => {
  it('works', () => {
    /* tslint:disable */
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
      [{ foo: 'bar' }],
      [new Date()],
      [/a/],
      [new RegExp('a')],
      [new Error('hello'), 'Error: hello'],
    ];
    /* tslint:enable */

   	for (let test of tests) {
      let wanted = test.length >= 2 ? test[1] : test[0];
      if (isNaN(wanted)) {
        continue;
      }
      expect(truncate(test[0])).toBe(wanted);
    }
  });

  it('omits functions in object', () => {
    /* tslint:disable */
    let obj = {
      foo: 'bar',
      fn1: Math.sin,
      fn2: () => null,
      fn3: new Function('x', 'y', 'return x * y'),
    };
    /* tslint:enable */

    expect(truncate(obj)).toStrictEqual({ foo: 'bar' });
  });

  it('sets object type', () => {
    let e = new Event('load');

    let got = truncate(e);
    expect(got.__type).toBe('Event');
  });

  describe('when called with object with circular references', () => {
    let obj = { foo: 'bar' };
    obj.circularRef = obj;
    obj.circularList = [obj, obj];
    let truncated;

    beforeEach(() => {
      truncated = truncate(obj);
    });

    it('produces object with resolved circular references', () => {
      expect(truncated).toStrictEqual({
        foo: 'bar',
        circularRef: '[Circular ~]',
        circularList: ['[Circular ~]', '[Circular ~]'],
      });
    });
  });

  describe('when called with object with complex circular references', () => {
    let a = { x: 1 };
    a.a = a;
    let b = { x: 2 };
    b.a = a;
    let c = { a, b };

    let obj = { list: [a, b, c] };
    obj.obj = obj;

    let truncated;

    beforeEach(() => {
      truncated = truncate(obj);
    });

    it('produces object with resolved circular references', () => {
      expect(truncated).toStrictEqual({
        list: [
          {
            x: 1,
            a: '[Circular ~.list.0]',
          },
          {
            x: 2,
            a: '[Circular ~.list.0]',
          },
          {
            a: '[Circular ~.list.0]',
            b: '[Circular ~.list.1]',
          },
        ],
        obj: '[Circular ~]',
      });
    });
  });

  describe('when called with deeply nested objects', () => {
    let obj = {};
    let tmp = obj;
    for (let i = 0; i < 100; i++) {
      tmp.value = i;
      tmp.obj = {};
      tmp = tmp.obj;
    }

    let truncated;

    beforeEach(() => {
      truncated = truncate(obj, { level: 1 });
    });

    it('produces truncated object', () => {
      expect(truncated).toStrictEqual({
        value: 0,
        obj: {
          value: 1,
          obj: {
            value: 2,
            obj: {
              value: 3,
              obj: '[Truncated Object]',
            },
          },
        },
      });
    });
  });

  describe('when called with object created with Object.create(null)', () => {
    it('works', () => {
      let obj = Object.create(null);
      obj.foo = 'bar';
      expect(truncate(obj)).toStrictEqual({ foo: 'bar' });
    });
  });

  describe('keysBlacklist', () => {
    it('filters blacklisted keys', () => {
      let obj = {
        params: {
          password: '123',
          sub: {
            secret: '123',
          },
        },
      };
      let keysBlacklist = [/password/, /secret/];
      let truncated = truncate(obj, { keysBlacklist });

      expect(truncated).toStrictEqual({
        params: {
          password: '[Filtered]',
          sub: { secret: '[Filtered]' },
        },
      });
    });
  });
});
