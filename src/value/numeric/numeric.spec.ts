import { beforeEach, describe, expect, it } from '@jest/globals';
import { textAndPriority } from '../../spec';
import { StypPriority } from '../priority';
import { StypFrequency, StypLength, StypLengthPt, StypTime } from '../unit';
import { stypValuesEqual } from '../value';
import { StypCalc, StypDimension } from './numeric';
import { StypAddSub, StypMulDiv } from './numeric.impl';

describe('StypDimension', () => {
  let value: StypDimension<StypLengthPt.Unit>;

  beforeEach(() => {
    value = StypLengthPt.of(16, 'px') as StypDimension<StypLengthPt.Unit>;
  });

  describe('is', () => {
    it('equals to itself', () => {
      expect(value.is(value)).toBe(true);
    });
    it('equals to the same `StypDimension`', () => {
      expect(value.is(StypLengthPt.of(16, 'px'))).toBe(true);
    });
    it('equals to different `StypDimension` with the same unit', () => {
      expect(value.is(StypLength.of(16, 'px'))).toBe(true);
    });
    it('not equal to `StypDimension` with different unit', () => {
      expect(value.is(StypLengthPt.of(16, 'rem'))).toBe(false);
    });
    it('not equal to `StypDimension` with different value', () => {
      expect(value.is(StypLengthPt.of(17, 'px'))).toBe(false);
    });
    it('not equal to scalar value', () => {
      expect(value.is('16px')).toBe(false);
    });
    it('not equal to different value type', () => {
      expect(value.is(value.add(StypLengthPt.of(33, '%')))).toBe(false);
    });
    it('not equal to the same value with different priority', () => {
      expect(value.is(value.important())).toBe(false);
    });
    it('equals to the same value with same priority', () => {
      expect(value.is(value.important().usual())).toBe(true);
    });
  });

  describe('add', () => {
    it('is `StypDimension` when addendum has the same unit', () => {
      expect(value.add(StypLengthPt.of(1, 'px'))).toMatchObject({
        type: 'dimension',
        val: 17,
        unit: 'px',
      });
    });
    it('is `StypDimension` when addendum is unitless number', () => {
      expect(value.add(1)).toMatchObject({
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
    it('is `StypCalc` when addendum is number with different unit', () => {
      const right = 1;
      const sum = value.add(right, '%') as StypCalc<StypLengthPt.Unit>;

      expect(sum.type).toBe('calc');
      expect(sum.dim).toBe(value.dim);
      expect(sum.left).toBe(value);
      expect(sum.op).toBe('+');
      expect(`${sum.right}`).toBe(`${StypLengthPt.of(right, '%')}`);
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
    it('is `StypDimension` when addendum is unitless number', () => {
      expect(value.sub(1)).toMatchObject({
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
    it('is `StypCalc` when addendum is number with different unit', () => {
      const right = 1;
      const diff = value.sub(right, '%') as StypCalc<StypLengthPt.Unit>;

      expect(diff.type).toBe('calc');
      expect(diff.dim).toBe(value.dim);
      expect(diff.left).toBe(value);
      expect(diff.op).toBe('-');
      expect(`${diff.right}`).toBe(`${StypLengthPt.of(1, '%')}`);
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
      expect(`${value.important()}`).toBe('16px');
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
    it('adds structured value', () => {
      expect(textAndPriority(calc.add(StypLengthPt.of(1, 'rem')))).toEqual([
        'calc((12px + 100%) + 1rem)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.add(StypLengthPt.of(1, 'rem')))).toEqual([
        'calc((12px + 100%) + 1rem)',
        StypPriority.Important,
      ]);
    });
    it('adds numeric value', () => {
      expect(textAndPriority(calc.add(1, 'rem'))).toEqual([
        'calc((12px + 100%) + 1rem)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.add(1, 'rem'))).toEqual([
        'calc((12px + 100%) + 1rem)',
        StypPriority.Important,
      ]);
    });
    it('does not add zero value', () => {
      expect(calc.add(StypLengthPt.zero)).toBe(calc);
      expect(important.add(StypLengthPt.zero)).toBe(important);
    });
  });

  describe('sub', () => {
    it('subtracts structured value', () => {
      expect(textAndPriority(calc.sub(StypLengthPt.of(1, 'rem')))).toEqual([
        'calc((12px + 100%) - 1rem)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.sub(StypLengthPt.of(1, 'rem')))).toEqual([
        'calc((12px + 100%) - 1rem)',
        StypPriority.Important,
      ]);
    });
    it('subtracts numeric value', () => {
      expect(textAndPriority(calc.sub(1, 'rem'))).toEqual([
        'calc((12px + 100%) - 1rem)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.sub(1, 'rem'))).toEqual([
        'calc((12px + 100%) - 1rem)',
        StypPriority.Important,
      ]);
    });
    it('does not subtract zero value', () => {
      expect(calc.sub(StypLengthPt.zero)).toBe(calc);
      expect(important.sub(StypLengthPt.zero)).toBe(important);
    });
  });

  describe('mul', () => {
    it('multiplies', () => {
      expect(textAndPriority(calc.mul(2))).toEqual(['calc((12px + 100%) * 2)', StypPriority.Usual]);
      expect(textAndPriority(important.mul(2))).toEqual([
        'calc((12px + 100%) * 2)',
        StypPriority.Important,
      ]);
    });
    it('multiplies the multiplier', () => {
      expect(textAndPriority(calc.mul(2).mul(3))).toEqual([
        'calc((12px + 100%) * 6)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.mul(2).mul(3))).toEqual([
        'calc((12px + 100%) * 6)',
        StypPriority.Important,
      ]);
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
      expect(textAndPriority(calc.div(3).mul(2))).toEqual([
        'calc((12px + 100%) / 1.5)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.div(3).mul(2))).toEqual([
        'calc((12px + 100%) / 1.5)',
        StypPriority.Important,
      ]);
    });
  });

  describe('div', () => {
    it('divides', () => {
      expect(textAndPriority(calc.div(2))).toEqual(['calc((12px + 100%) / 2)', StypPriority.Usual]);
      expect(textAndPriority(important.div(2))).toEqual([
        'calc((12px + 100%) / 2)',
        StypPriority.Important,
      ]);
    });
    it('multiplies the divisor', () => {
      expect(textAndPriority(calc.div(2).div(3))).toEqual([
        'calc((12px + 100%) / 6)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.div(2).div(3))).toEqual([
        'calc((12px + 100%) / 6)',
        StypPriority.Important,
      ]);
    });
    it('results to the left operand when divided by one', () => {
      expect(calc.div(1)).toBe(calc);
      expect(important.div(1)).toBe(important);
    });
    it('divides the multiplier', () => {
      expect(textAndPriority(calc.mul(3).div(2))).toEqual([
        'calc((12px + 100%) * 1.5)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.mul(3).div(2))).toEqual([
        'calc((12px + 100%) * 1.5)',
        StypPriority.Important,
      ]);
    });
  });

  describe('negate', () => {
    it('negates operands of the sum', () => {
      expect(textAndPriority(calc.negate())).toEqual(['calc(-12px - 100%)', StypPriority.Usual]);
      expect(textAndPriority(important.negate())).toEqual([
        'calc(-12px - 100%)',
        StypPriority.Important,
      ]);
    });
    it('reverts operands of the diff', () => {
      calc = left.sub(right) as StypCalc<StypLengthPt.Unit>;
      important = calc.important();
      expect(textAndPriority(calc.negate())).toEqual(['calc(100% - 12px)', StypPriority.Usual]);
      expect(textAndPriority(important.negate())).toEqual([
        'calc(100% - 12px)',
        StypPriority.Important,
      ]);
    });
    it('negates the multiplier', () => {
      expect(textAndPriority(calc.mul(2).negate())).toEqual([
        'calc((12px + 100%) * -2)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.mul(2).negate())).toEqual([
        'calc((12px + 100%) * -2)',
        StypPriority.Important,
      ]);
    });
    it('negates the divisor', () => {
      expect(textAndPriority(calc.div(2).negate())).toEqual([
        'calc((12px + 100%) / -2)',
        StypPriority.Usual,
      ]);
      expect(textAndPriority(important.div(2).negate())).toEqual([
        'calc((12px + 100%) / -2)',
        StypPriority.Important,
      ]);
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
      expect(`${important}`).toBe('calc(12px + 100%)');
    });
  });
});

describe('StypAddSub', () => {
  let calc: StypLength;
  let calcPt: StypLengthPt;
  let important: StypLength;
  let importantPt: StypLengthPt;

  beforeEach(() => {
    calc = StypLength.of(12, 'px').add(StypLength.of(2, 'rem'));
    important = calc.important();
    calcPt = StypLengthPt.of(12, 'px').sub(StypLengthPt.of(2, 'rem'));
    importantPt = calcPt.important();
  });

  describe('toDim', () => {
    it('converts to the same dimension', () => {
      expect(calc.toDim(calc.dim)).toBe(calc);
      expect(important.toDim(important.dim)).toBe(important);
    });
    it('converts to percent dimension', () => {
      expect(calc.toDim(StypLengthPt)).toBe(calc);
      expect(important.toDim(StypLengthPt)).toBe(important);
    });
    it('converts to non-percent dimension', () => {
      expect(calcPt.toDim(StypLength)).toBe(calcPt);
      expect(importantPt.toDim(StypLength)).toBe(importantPt);
    });
    it('does not convert to non-percent dimension when left operand has percent unit', () => {
      calcPt = StypLengthPt.of(12, '%').sub(StypLengthPt.of(2, 'rem'));
      importantPt = calcPt.important();
      expect(calcPt.toDim(StypLength)).toBeUndefined();
      expect(importantPt.toDim(StypLength)).toBeUndefined();
    });
    it('does not convert to non-percent dimension when right operand has percent unit', () => {
      calcPt = StypLengthPt.of(12, 'px').sub(StypLengthPt.of(20, '%'));
      importantPt = calcPt.important();
      expect(calcPt.toDim(StypLength)).toBeUndefined();
      expect(importantPt.toDim(StypLength)).toBeUndefined();
    });
    it('does not convert to incompatible dimension', () => {
      expect(calc.toDim(StypTime)).toBeUndefined();
      expect(important.toDim(StypTime)).toBeUndefined();
      expect(calcPt.toDim(StypTime)).toBeUndefined();
      expect(importantPt.toDim(StypTime)).toBeUndefined();
    });
    it('converts to incompatible dimension when operands are zeroes', () => {
      calc = new StypAddSub(StypLength.zero, '+', StypLength.zero, { dim: StypLength });
      important = calc.important();

      const expected = new StypAddSub(StypFrequency.zero, '+', StypFrequency.zero, {
        dim: StypFrequency,
      });

      expect(stypValuesEqual(calc.toDim(StypFrequency), expected)).toBe(true);
      expect(stypValuesEqual(important.toDim(StypFrequency), expected.important())).toBe(true);
    });
  });
});

describe('StypMulDiv', () => {
  let calc: StypLength;
  let calcPt: StypLengthPt;
  let important: StypLength;
  let importantPt: StypLengthPt;

  beforeEach(() => {
    calc = StypLength.of(12, 'px').add(StypLength.of(2, 'rem')).mul(3);
    important = calc.important();
    calcPt = StypLengthPt.of(12, 'px').sub(StypLengthPt.of(2, 'rem')).div(2);
    importantPt = calcPt.important();
  });

  describe('toDim', () => {
    it('converts to the same dimension', () => {
      expect(calc.toDim(calc.dim)).toBe(calc);
      expect(important.toDim(important.dim)).toBe(important);
    });
    it('converts to percent dimension', () => {
      expect(calc.toDim(StypLengthPt)).toBe(calc);
      expect(important.toDim(StypLengthPt)).toBe(important);
    });
    it('converts to non-percent dimension', () => {
      expect(calcPt.toDim(StypLength)).toBe(calcPt);
      expect(importantPt.toDim(StypLength)).toBe(importantPt);
    });
    it('does not convert to non-percent dimension when left operand has percent unit', () => {
      calcPt = StypLengthPt.of(12, '%').sub(StypLengthPt.of(2, 'rem')).mul(3);
      importantPt = calcPt.important();
      expect(calcPt.toDim(StypLength)).toBeUndefined();
      expect(importantPt.toDim(StypLength)).toBeUndefined();
    });
    it('does not convert to incompatible dimension', () => {
      expect(calc.toDim(StypTime)).toBeUndefined();
      expect(important.toDim(StypTime)).toBeUndefined();
      expect(calcPt.toDim(StypTime)).toBeUndefined();
      expect(importantPt.toDim(StypTime)).toBeUndefined();
    });
    it('converts to incompatible dimension when operand is zero', () => {
      calc = new StypMulDiv(StypLength.zero, '*', 10, { dim: StypLength });
      important = calc.important();

      const expected = new StypMulDiv(StypFrequency.zero, '*', 10, { dim: StypFrequency });

      expect(stypValuesEqual(calc.toDim(StypFrequency), expected)).toBe(true);
      expect(stypValuesEqual(important.toDim(StypFrequency), expected.important())).toBe(true);
    });
  });
});
