import { StypLength, StypLengthPt, StypResolution, StypTime } from '../unit';
import { stypValuesEqual } from '../value';
import { StypZero } from './zero';

describe('StypZero', () => {

  let zero: StypZero<StypLengthPt.TUnit>;
  let important: StypZero<StypLengthPt.TUnit>;

  beforeEach(() => {
    zero = StypLengthPt.zero;
    important = zero.important();
  });

  describe('type', () => {
    it('is `0`', () => {
      expect(zero.type).toBe(0);
      expect(important.type).toBe(0);
    });
  });

  describe('dim', () => {
    it('is original', () => {
      expect(zero.dim).toBe(StypLengthPt);
      expect(important.dim).toBe(StypLengthPt);
    });
  });

  describe('toDim', () => {
    it('returns a zero in another dimension', () => {
      expect(zero.toDim(StypLength)).toBe(StypLength.zero);
      expect(important.toDim(StypTime)).toBe(StypTime.zero.important());
      expect(stypValuesEqual(zero.toDim(StypResolution), StypResolution.zero)).toBe(true);
    });
  });

  it('differs from zero of another dimension', () => {
    expect(StypLengthPt.zero).toBe(zero);
    expect(StypLength.zero).not.toBe(zero);
  });
  it('is equal to zero of another dimension', () => {
    expect(zero.is(StypLength.zero)).toBe(true);
  });
  it('is equal to zero scalar value', () => {
    expect(zero.is(0)).toBe(true);
    expect(zero.is('0')).toBe(true);
    expect(zero.is('0 !important')).toBe(false);
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
    expect(important.usual().is(zero)).toBe(true);
    expect(important.usual()).toBe(zero);
    expect(important.usual()).not.toBe(important);
  });
  it('is equal to important value when important', () => {
    expect(zero.important().is(important)).toBe(true);
    expect(zero.important()).toBe(important);
    expect(zero.important()).not.toBe(zero);
  });

  describe('add', () => {
    it('is equal to structured addendum', () => {

      const right = StypLengthPt.of(12, '%');

      expect(zero.add(right)).toBe(right);
    });
    it('is equal to numeric addendum', () => {

      const right = 12;

      expect(zero.add(right, '%').is(StypLengthPt.of(right, '%'))).toBe(true);
    });
    it('inherits priority', () => {

      const right = StypLengthPt.of(12, '%');

      expect(important.add(right).is(right.important())).toBe(true);
    });
  });

  describe('sub', () => {
    it('is equal to structured -addendum', () => {

      const right = StypLengthPt.of(12, '%');

      expect(zero.sub(right).is(right.negate())).toBe(true);
    });
    it('is equal to numeric -addendum', () => {

      const right = 12;

      expect(zero.sub(right, '%').is(StypLengthPt.of(right, '%').negate())).toBe(true);
    });
    it('inherits priority', () => {

      const right = StypLengthPt.of(12, '%');

      expect(important.sub(right).is(right.important().negate())).toBe(true);
    });
  });

  describe('mul', () => {
    it('is always zero', () => {
      expect(zero.mul(123)).toBe(zero);
      expect(important.mul(123)).toBe(important);
    });
  });

  describe('div', () => {
    it('is always zero', () => {
      expect(zero.div(123)).toBe(zero);
      expect(important.div(123)).toBe(important);
    });
  });

  describe('negate', () => {
    it('is always zero', () => {
      expect(zero.negate()).toBe(zero);
      expect(important.negate()).toBe(important);
    });
  });

  describe('prioritize', () => {
    it('assigns priority', () => {

      const prioritized = zero.prioritize(2);

      expect(prioritized.priority).toBe(2);
    });
  });

  describe('important', () => {
    it('is singleton', () => {
      expect(zero.important()).toBe(important);
      expect(important.important()).toBe(important);
      expect(zero.prioritize(1)).toBe(important);
    });
  });

  describe('usual', () => {
    it('is singleton', () => {
      expect(zero.usual()).toBe(zero);
      expect(important.usual()).toBe(zero);
      expect(zero.prioritize(0)).toBe(zero);
    });
  });

  describe('toFormula', () => {
    it('is always `0`', () => {
      expect(zero.toFormula()).toBe('0');
      expect(important.toFormula()).toBe('0');
    });
  });

  describe('toString', () => {
    it('is `0`', () => {
      expect(`${zero}`).toBe('0');
      expect(`${important}`).toBe('0');
    });
  });
});
