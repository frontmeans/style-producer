import { StypLength } from './unit';
import { stypSplitPriority, stypValuesEqual } from './value';

describe('stypSplitPriority', () => {
  it('splits nothing when there is no value', () => {

    const result: [] = stypSplitPriority(undefined);

    expect(result).toEqual([]);
  });
  it('splits string value and priority', () => {

    const result1: [string, 'important'?] = stypSplitPriority('1px !important');

    expect(result1).toEqual(['1px', 'important']);

    const result2 = stypSplitPriority('1px');

    expect(result2).toEqual(['1px']);
  });
  it('does not extract priority from scalar value', () => {

    const result: [number] = stypSplitPriority(1);

    expect(result).toEqual([1]);
  });
  it('splits structures value and priority', () => {

    const value = StypLength.of(1, 'px');

    const result1: [StypLength, 'important'?] = stypSplitPriority(value.important());

    expect(result1).toEqual([value, 'important']);

    const result2: [StypLength, 'important'?] = stypSplitPriority(value);

    expect(result2).toEqual([value]);
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

    const value = StypLength.of(1, 'px');

    expect(stypValuesEqual(value, value)).toBe(true);
    expect(stypValuesEqual(value, StypLength.of(1, 'px'))).toBe(true);
    expect(stypValuesEqual(value, StypLength.of(1, 'em'))).toBe(false);
    expect(stypValuesEqual(value, value.important())).toBe(false);
  });
  it('compares structured values', () => {

    const value = StypLength.of(1, 'px');

    expect(stypValuesEqual(value, '1px')).toBe(false);
    expect(stypValuesEqual('1px', value)).toBe(false);
    expect(stypValuesEqual(StypLength.zero, 0)).toBe(true);
    expect(stypValuesEqual('0 !important', StypLength.zero.important())).toBe(true);
  });
});
