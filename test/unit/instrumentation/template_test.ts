import { replaceTemplate } from '../../../src/instrumentation/template';
import { expect } from '../sinon_chai';

describe('replaceTemplate', () => {
  it('return string', () => {
    expect(replaceTemplate('a')).to.equal('a');
  });

  it('replace template', () => {
    expect(replaceTemplate('{t}', {t: 1})).to.equal('1');
  });

  it('replace same template multiple times', () => {
    expect(replaceTemplate('a {b} {b} b', {b: 'z'})).to.equal('a z z b');
  });

  it('replace multiple templates', () => {
    expect(replaceTemplate('a {first} {second}', {first: 1, second: 'two'})).to.equal('a 1 two');
  });

  it('trows when template value is not found', () => {
    expect(() => {
      replaceTemplate('a {b} {c}', {b: 1})
    }).to.throw('airbrake: Missing value for parameter "c".');
  });
});
