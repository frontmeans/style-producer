import { stypLength, StypLength, stypLengthPt, StypLengthPt, stypPercentage } from './unit';
import { StypCalc, StypNumber } from './numeric';
import { stypZero } from './zero';

describe('StypNumber', () => {

  let value: StypLengthPt;

  beforeEach(() => {
    value = stypLength(16, 'px') as StypLengthPt;
  });

  it('is of type `number`', () => {
    expect(value.type).toBe('number');
  });
  it('is of type `0` when value is `0`', () => {
    expect(stypLength(0, 'px').type).toBe('0');
  });
  it('is equal to itself', () => {
    expect(value.is(value)).toBe(true);
  });
  it('is equal to the same StypNumber', () => {
    expect(value.is(stypLength(16, 'px'))).toBe(true);
  });
  it('is not equal to StypNumber with different unit', () => {
    expect(value.is(stypLength(16, 'rem'))).toBe(false);
  });
  it('is not equal to StypNumber with different value', () => {
    expect(value.is(stypLength(17, 'px'))).toBe(false);
  });
  it('is not equal to scalar value', () => {
    expect(value.is('16px')).toBe(false);
  });
  it('is not equal to different value type', () => {
    expect(value.is(value.add(stypPercentage(33)))).toBe(false);
  });
  it('is not equal to the same value with different priority', () => {
    expect(value.is(value.important())).toBe(false);
  });
  it('is not equal to the same value with same priority', () => {
    expect(value.is(value.important().usual())).toBe(true);
  });

  describe('add', () => {
    it('is `StypNumber` when addendum has the same unit', () => {
      expect(value.add(stypLength(1, 'px'))).toMatchObject({
        type: 'number',
        val: 17,
        unit: 'px',
      });
    });
    it('is `StypCalc` when addendum has different unit', () => {

      const right = stypPercentage<StypLength.Unit>(1);
      const sum = value.add(right);

      expect(sum.type).toBe('calc');
      expect(sum).toMatchObject({
        left: value,
        op: '+',
        right,
      });
    });
    it('is the same value when addendum is zero', () => {
      expect(value.add(stypZero)).toBe(value);
    });
  });

  describe('sub', () => {
    it('is `StypNumber` when addendum has the same unit', () => {
      expect(value.sub(stypLength(1, 'px'))).toMatchObject({
        type: 'number',
        val: 15,
        unit: 'px',
      });
    });
    it('is `StypCalc` when addendum has different unit', () => {

      const right = stypPercentage<StypLengthPt.Unit>(1);
      const diff = value.sub(right);

      expect(diff.type).toBe('calc');
      expect(diff).toMatchObject({
        left: value,
        op: '-',
        right,
      });
    });
    it('is the same value when addendum is zero', () => {
      expect(value.sub(stypZero)).toBe(value);
    });
  });

  describe('mul', () => {
    it('is `StypNumber` by default', () => {
      expect(value.mul(2)).toMatchObject({
        type: 'number',
        val: 32,
        unit: 'px',
      });
    });
    it('is the same value when multiplier is `1`', () => {
      expect(value.mul(1)).toBe(value);
    });
    it('is zero when multiplier is `0`', () => {
      expect(value.mul(0)).toBe(stypZero);
    });
  });

  describe('div', () => {
    it('is `StypNumber` by default', () => {
      expect(value.div(2)).toMatchObject({
        type: 'number',
        val: 8,
        unit: 'px',
      });
    });
    it('is the same value when divisor is `1`', () => {
      expect(value.div(1)).toBe(value);
    });
    it('is infinity when divisor is `0`', () => {
      expect(value.div(0)).toMatchObject({
        type: 'number',
        val: Infinity,
        unit: 'px',
      });
    });
  });

  describe('negate', () => {
    it('is `StypNumber`', () => {
      expect(value.negate()).toMatchObject({
        type: 'number',
        val: -16,
        unit: 'px',
      });
    });
  });

  describe('toFormula', () => {
    it('is `<value><unit>`', () => {
      expect(value.toFormula()).toBe('16px');
      expect(value.important().toFormula()).toBe('16px');
    });
  });

  describe('toString', () => {
    it('is `<value><unit>`', () => {
      expect(`${value}`).toBe('16px');
    });
    it('is `<value><unit> !important` is important', () => {
      expect(`${value.important()}`).toBe('16px !important');
    });
  });
});

describe('StypCalc', () => {

  let left: StypLengthPt;
  let right: StypLengthPt;
  let calc: StypCalc<StypLengthPt.Unit>;
  let important: StypCalc<StypLengthPt.Unit>;

  beforeEach(() => {
    left = stypLengthPt(12, 'px');
    right = stypPercentage(100);
    calc = left.add(right) as StypCalc<StypLengthPt.Unit>;
    important = calc.important();
  });

  it('has `calc` type', () => {
    expect(calc.type).toBe('calc');
  });
  it('contains operands', () => {
    expect(calc).toMatchObject({
      left: left,
      op: '+',
      right: right,
    });
  });

  it('is equal to itself', () => {
    expect(calc.is(calc)).toBe(true);
  });
  it('is equal to the same value', () => {
    expect(calc.is(left.add(right))).toBe(true);
  });
  it('un-prioritizes operands', () => {
    expect(calc.is(left.add(right.important()))).toBe(true);
    expect(calc.is(left.important().add(right).usual())).toBe(true);
  });
  it('is not equal to the same value with different priority', () => {
    expect(calc.is(important)).toBe(false);
  });
  it('is not equal to another value type', () => {
    expect(calc.is(left)).toBe(false);
  });
  it('is not equal to the value with different operands', () => {
    expect(calc.is(left.add(right.div(2)))).toBe(false);
    expect(calc.is(left.mul(2).add(right))).toBe(false);
  });

  describe('add', () => {
    it('adds the value', () => {
      expect(`${calc.add(stypLength(1, 'rem'))}`).toBe('calc((12px + 100%) + 1rem)');
      expect(`${important.add(stypLength(1, 'rem'))}`).toBe('calc((12px + 100%) + 1rem) !important');
    });
    it('does not add zero value', () => {
      expect(calc.add(stypZero)).toBe(calc);
      expect(important.add(stypZero)).toBe(important);
    });
  });

  describe('sub', () => {
    it('subtracts the value', () => {
      expect(`${calc.sub(stypLength(1, 'rem'))}`).toBe('calc((12px + 100%) - 1rem)');
      expect(`${important.sub(stypLength(1, 'rem'))}`).toBe('calc((12px + 100%) - 1rem) !important');
    });
    it('does not subtract zero value', () => {
      expect(calc.sub(stypZero)).toBe(calc);
      expect(important.sub(stypZero)).toBe(important);
    });
  });

  describe('mul', () => {
    it('multiplies', () => {
      expect(`${calc.mul(2)}`).toBe('calc((12px + 100%) * 2)');
      expect(`${important.mul(2)}`).toBe('calc((12px + 100%) * 2) !important');
    });
    it('multiplies the multiplier', () => {
      expect(`${calc.mul(2).mul(3)}`).toBe('calc((12px + 100%) * 6)');
      expect(`${important.mul(2).mul(3)}`).toBe('calc((12px + 100%) * 6) !important');
    });
    it('results to zero when multiplied by zero', () => {
      expect(calc.mul(0)).toBe(stypZero);
      expect(important.mul(0)).toBe(stypZero.important());
    });
    it('results to the left operand when multiplied by one', () => {
      expect(calc.mul(1)).toBe(calc);
      expect(important.mul(1)).toBe(important);
    });
    it('divides the divisor', () => {
      expect(`${calc.div(3).mul(2)}`).toBe('calc((12px + 100%) / 1.5)');
      expect(`${important.div(3).mul(2)}`).toBe('calc((12px + 100%) / 1.5) !important');
    });
  });

  describe('div', () => {
    it('divides', () => {
      expect(`${calc.div(2)}`).toBe('calc((12px + 100%) / 2)');
      expect(`${important.div(2)}`).toBe('calc((12px + 100%) / 2) !important');
    });
    it('multiplies the divisor', () => {
      expect(`${calc.div(2).div(3)}`).toBe('calc((12px + 100%) / 6)');
      expect(`${important.div(2).div(3)}`).toBe('calc((12px + 100%) / 6) !important');
    });
    it('results to the left operand when divided by one', () => {
      expect(calc.div(1)).toBe(calc);
      expect(important.div(1)).toBe(important);
    });
    it('divides the multiplier', () => {
      expect(`${calc.mul(3).div(2)}`).toBe('calc((12px + 100%) * 1.5)');
      expect(`${important.mul(3).div(2)}`).toBe('calc((12px + 100%) * 1.5) !important');
    });
  });

  describe('negate', () => {
    it('negates operands of the sum', () => {
      expect(`${calc.negate()}`).toBe('calc(-12px - 100%)');
      expect(`${important.negate()}`).toBe('calc(-12px - 100%) !important');
    });
    it('reverts operands of the diff', () => {
      calc = left.sub(right) as StypCalc<StypLengthPt.Unit>;
      important = calc.important();
      expect(`${calc.negate()}`).toBe('calc(100% - 12px)');
      expect(`${important.negate()}`).toBe('calc(100% - 12px) !important');
    });
    it('negates the multiplier', () => {
      expect(`${calc.mul(2).negate()}`).toBe('calc((12px + 100%) * -2)');
      expect(`${important.mul(2).negate()}`).toBe('calc((12px + 100%) * -2) !important');
    });
    it('negates the divisor', () => {
      expect(`${calc.div(2).negate()}`).toBe('calc((12px + 100%) / -2)');
      expect(`${important.div(2).negate()}`).toBe('calc((12px + 100%) / -2) !important');
    });
  });

  describe('toFormula', () => {
    it('is formula in parentheses', () => {
      expect(calc.toFormula()).toBe('(12px + 100%)');
      expect(important.toFormula()).toBe('(12px + 100%)');
    });
  });

  describe('toString', () => {
    it('is calc() function call', () => {
      expect(`${calc}`).toBe('calc(12px + 100%)');
      expect(`${important}`).toBe('calc(12px + 100%) !important');
    });
  });
});
