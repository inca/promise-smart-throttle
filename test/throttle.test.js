'use strict';

const throttle = require('../src/index');
const { expect } = require('chai');

describe('smart throttle', () => {

  let callsCount = 0;

  function uppercase(q) {
    return new Promise(resolve => {
      callsCount += 1;
      setTimeout(() => resolve(q.toUpperCase()), 50);
    });
  }

  beforeEach(() => callsCount = 0);

  it('should resolve immediate result if tapped once', async () => {
    const throttled = throttle(uppercase, 50);
    const startedAt = Date.now();
    const res = await throttled('hello');
    expect(res).to.equal('HELLO');
    expect(Date.now() - startedAt).to.be.below(100);
    expect(callsCount).to.equal(1);
  });

  it('should resolve latest result if called multiple times', async () => {
    const startedAt = Date.now();
    const throttled = throttle(uppercase, 50);
    const first = throttled('hello');
    const second = throttled('hi');
    const third = throttled('hey');
    throttled('ho');
    throttled('lots of calls allowed');
    throttled('only last will win anyway');
    setTimeout(() => throttled('howdy'), 10);
    expect(await first).to.equal('HELLO');
    expect(await second).to.equal('HOWDY');
    expect(await third).to.equal('HOWDY');
    expect(callsCount).to.equal(2);
    expect(Date.now() - startedAt).to.be.above(150);
    expect(Date.now() - startedAt).to.be.below(200);
  });

});
