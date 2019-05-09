import { stypPercentage } from './dim';
import { stypZero, StypZero } from './zero';

describe('StypZero', () => {

  let important: StypZero<any>;

  beforeEach(() => {
    important = stypZero.important();
  });

  it('is of type `0`', () => {
    expect(stypZero.type).toBe('0');
    expect(important.type).toBe('0');
  });
  it('is equal to zero scalar value', () => {
    expect(stypZero.is(0)).toBe(true);
    expect(stypZero.is('0')).toBe(true);
    expect(stypZero.is('0 !important')).toBe(false);
  });
  it('is equal to zero scalar value when important', () => {
    expect(important.is(0)).toBe(false);
    expect(important.is('0')).toBe(false);
    expect(important.is('0 !important')).toBe(true);
  });
  it('is not equal to anything else', () => {
    expect(important.is('1px')).toBe(false);
  });
  it('is equal to usual value', () => {
    expect(important.usual().is(stypZero)).toBe(true);
    expect(important.usual()).toBe(stypZero);
    expect(important.usual()).not.toBe(important);
  });
  it('is equal to important value when important', () => {
    expect(stypZero.important().is(important)).toBe(true);
    expect(stypZero.important()).toBe(important);
    expect(stypZero.important()).not.toBe(stypZero);
  });

  describe('add', () => {
    it('is equal to addendum', () => {

      const right = stypPercentage(12);

      expect(stypZero.add(right)).toBe(right);
    });
    it('inherits priority', () => {

      const right = stypPercentage(12);

      expect(important.add(right).is(right.important())).toBe(true);
    });
  });

  describe('sub', () => {
    it('is equal to -addendum', () => {

      const right = stypPercentage(12);

      expect(stypZero.sub(right).is(right.negate())).toBe(true);
    });
    it('inherits priority', () => {

      const right = stypPercentage(12);

      expect(important.sub(right).is(right.important().negate())).toBe(true);
    });
  });

  describe('mul', () => {
    it('is always zero', () => {
      expect(stypZero.mul(123)).toBe(stypZero);
      expect(important.mul(123)).toBe(important);
    });
  });

  describe('div', () => {
    it('is always zero', () => {
      expect(stypZero.div(123)).toBe(stypZero);
      expect(important.div(123)).toBe(important);
    });
  });

  describe('negate', () => {
    it('is always zero', () => {
      expect(stypZero.negate()).toBe(stypZero);
      expect(important.negate()).toBe(important);
    });
  });

  describe('toFormula', () => {
    it('is always `0`', () => {
      expect(stypZero.toFormula()).toBe('0');
      expect(important.toFormula()).toBe('0');
    });
  });

  describe('toString', () => {
    it('is `0`', () => {
      expect(`${stypZero}`).toBe('0');
    });
    it('is `0 !important` if important', () => {
      expect(`${important}`).toBe('0 !important');
    });
  });
});
