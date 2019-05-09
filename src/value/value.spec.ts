import { stypLength } from './unit';
import { stypSplitPriority, stypValuesEqual } from './value';
import { stypZero } from './zero';

describe('stypSplitPriority', () => {
  it('splits nothing when there is no value', () => {
    expect(stypSplitPriority(undefined)).toEqual([]);
  });
  it('splits string value and priority', () => {
    expect(stypSplitPriority('1px !important')).toEqual(['1px', 'important']);
    expect(stypSplitPriority('1px')).toEqual(['1px']);
  });
  it('does not extract priority from scalar value', () => {
    expect(stypSplitPriority(1)).toEqual([1]);
  });
  it('splits structures value and priority', () => {

    const value = stypLength(1, 'px');

    expect(stypSplitPriority(value.important())).toEqual([value, 'important']);
    expect(stypSplitPriority(value)).toEqual([value]);
  });
});

describe('stypValuesEqual', () => {
  it('compares scalar values', () => {
    expect(stypValuesEqual('bold', 'bold')).toBe(true);
    expect(stypValuesEqual('bold', 'bolder')).toBe(false);
    expect(stypValuesEqual('bold', undefined)).toBe(false);
    expect(stypValuesEqual(undefined, undefined)).toBe(true);
  });
  it('compares structured values', () => {

    const value = stypLength(1, 'px');

    expect(stypValuesEqual(value, value)).toBe(true);
    expect(stypValuesEqual(value, stypLength(1, 'px'))).toBe(true);
    expect(stypValuesEqual(value, stypLength(1, 'em'))).toBe(false);
    expect(stypValuesEqual(value, value.important())).toBe(false);
  });
  it('compares structured values', () => {

    const value = stypLength(1, 'px');

    expect(stypValuesEqual(value, '1px')).toBe(false);
    expect(stypValuesEqual('1px', value)).toBe(false);
    expect(stypValuesEqual(stypZero, 0)).toBe(true);
    expect(stypValuesEqual('0 !important', stypZero.important())).toBe(true);
  });
});
