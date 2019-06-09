import { stypSplitPriority } from './priority';
import { StypLength } from './unit';
import { StypValue } from './value';

describe('stypSplitPriority', () => {
  it('splits nothing when there is no value', () => {

    const result: [undefined, 0] = stypSplitPriority(undefined);

    expect(result).toEqual([undefined, 0]);
  });
  it('splits string value and priority', () => {

    const result1: [string, 0 | 1] = stypSplitPriority('1px !important');

    expect(result1).toEqual(['1px', 1]);

    const result2 = stypSplitPriority('1px');

    expect(result2).toEqual(['1px', 0]);
  });
  it('does not extract priority from scalar value', () => {

    const result: [number, 0] = stypSplitPriority(1);

    expect(result).toEqual([1, 0]);
  });
  it('splits structures value and priority', () => {

    const value = StypLength.of(1, 'px');

    const result1: [StypLength, number] = stypSplitPriority(value.important());

    expect(valueTextAndPriority(result1)).toEqual([`${value}`, 1]);

    const result2: [StypLength, number] = stypSplitPriority(value);

    expect(valueTextAndPriority(result2)).toEqual([`${value}`, 0]);

    const result3: [StypLength, number] = stypSplitPriority(value.prioritize(0.5));

    expect(valueTextAndPriority(result3)).toEqual([`${value}`, 0.5]);
  });
});

function valueTextAndPriority([value, priority]: [StypValue, number]): [string, number] {
  return [`${value}`, priority];
}
