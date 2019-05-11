import { StypCalc, StypDimension } from './numeric';
import { StypLength, StypLengthPt } from './unit';

describe('StypDimension', () => {

  let value: StypLengthPt;

  beforeEach(() => {
    value = StypLengthPt.of(16, 'px');
  });

  it('is of type `dimension`', () => {
    expect(value.type).toBe('dimension');
  });
  it('is of type `0` when value is `0`', () => {
    expect(StypLengthPt.of(0, 'px').type).toBe(0);
  });
  it('is equal to itself', () => {
    expect(value.is(value)).toBe(true);
  });
  it('is equal to the same `StypDimension`', () => {
    expect(value.is(StypLengthPt.of(16, 'px'))).toBe(true);
  });
  it('is equal to different `StypDimension` with the same unit', () => {
    expect(value.is(StypLength.of(16, 'px'))).toBe(true);
  });
  it('is not equal to `StypDimension` with different unit', () => {
    expect(value.is(StypLengthPt.of(16, 'rem'))).toBe(false);
  });
  it('is not equal to `StypDimension` with different value', () => {
    expect(value.is(StypLengthPt.of(17, 'px'))).toBe(false);
  });
  it('is not equal to scalar value', () => {
    expect(value.is('16px')).toBe(false);
  });
  it('is not equal to different value type', () => {
    expect(value.is(value.add(StypLengthPt.of(33, '%')))).toBe(false);
  });
  it('is not equal to the same value with different priority', () => {
    expect(value.is(value.important())).toBe(false);
  });
  it('is not equal to the same value with same priority', () => {
    expect(value.is(value.important().usual())).toBe(true);
  });

  describe('add', () => {
    it('is `StypDimension` when addendum has the same unit', () => {
      expect(value.add(StypLengthPt.of(1, 'px'))).toMatchObject({
        type: 'dimension',
        val: 17,
        unit: 'px',
      });
    });
    it('is `StypCalc` when addendum has different unit', () => {

      const right = StypLengthPt.of(1, '%');
      const sum = value.add(right) as StypCalc<StypLengthPt.Unit>;

      expect(sum.type).toBe('calc');
      expect(sum.dim).toBe(value.dim);
      expect(sum.left).toBe(value);
      expect(sum.op).toBe('+');
      expect(sum.right).toBe(right);
    });
    it('is the same value when addendum is zero', () => {
      expect(value.add(StypLengthPt.zero)).toBe(value);
    });
  });

  describe('sub', () => {
    it('is `StypDimension` when addendum has the same unit', () => {
      expect(value.sub(StypLengthPt.of(1, 'px'))).toMatchObject({
        type: 'dimension',
        val: 15,
        unit: 'px',
      });
    });
    it('is `StypCalc` when addendum has different unit', () => {

      const right = StypLengthPt.of(1, '%');
      const diff = value.sub(right) as StypCalc<StypLengthPt.Unit>;

      expect(diff.type).toBe('calc');
      expect(diff.dim).toBe(value.dim);
      expect(diff.left).toBe(value);
      expect(diff.op).toBe('-');
      expect(diff.right).toBe(right);
    });
    it('is the same value when addendum is zero', () => {
      expect(value.sub(StypLengthPt.zero)).toBe(value);
    });
  });

  describe('mul', () => {
    it('is `StypDimension` by default', () => {

      const product = value.mul(2) as StypDimension<StypLengthPt.Unit>;

      expect(product.type).toBe('dimension');
      expect(product.dim).toBe(value.dim);
      expect(product.val).toBe(32);
      expect(product.unit).toBe('px');
    });
    it('is the same value when multiplier is `1`', () => {
      expect(value.mul(1)).toBe(value);
    });
    it('is zero when multiplier is `0`', () => {
      expect(value.mul(0)).toBe(StypLengthPt.zero);
    });
  });

  describe('div', () => {
    it('is `StypDimension` by default', () => {
      expect(value.div(2)).toMatchObject({
        type: 'dimension',
        val: 8,
        unit: 'px',
      });
    });
    it('is the same value when divisor is `1`', () => {
      expect(value.div(1)).toBe(value);
    });
    it('is infinity when divisor is `0`', () => {
      expect(value.div(0)).toMatchObject({
        type: 'dimension',
        val: Infinity,
        unit: 'px',
      });
    });
  });

  describe('negate', () => {
    it('is `StypDimension`', () => {
      expect(value.negate()).toMatchObject({
        type: 'dimension',
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
    left = StypLengthPt.of(12, 'px');
    right = StypLengthPt.of(100, '%');
    calc = left.add(right) as StypCalc<StypLengthPt.Unit>;
    important = calc.important();
  });

  it('has `calc` type', () => {
    expect(calc.type).toBe('calc');
    expect(calc.dim).toBe(left.dim);
  });
  it('contains operands', () => {
    expect(calc.left).toBe(left);
    expect(calc.op).toBe('+');
    expect(calc.right).toBe(right);
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
      expect(`${calc.add(StypLengthPt.of(1, 'rem'))}`).toBe('calc((12px + 100%) + 1rem)');
      expect(`${important.add(StypLengthPt.of(1, 'rem'))}`).toBe('calc((12px + 100%) + 1rem) !important');
    });
    it('does not add zero value', () => {
      expect(calc.add(StypLengthPt.zero)).toBe(calc);
      expect(important.add(StypLengthPt.zero)).toBe(important);
    });
  });

  describe('sub', () => {
    it('subtracts the value', () => {
      expect(`${calc.sub(StypLengthPt.of(1, 'rem'))}`).toBe('calc((12px + 100%) - 1rem)');
      expect(`${important.sub(StypLengthPt.of(1, 'rem'))}`).toBe('calc((12px + 100%) - 1rem) !important');
    });
    it('does not subtract zero value', () => {
      expect(calc.sub(StypLengthPt.zero)).toBe(calc);
      expect(important.sub(StypLengthPt.zero)).toBe(important);
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
      expect(calc.mul(0)).toBe(StypLengthPt.zero);
      expect(important.mul(0)).toBe(StypLengthPt.zero.important());
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
