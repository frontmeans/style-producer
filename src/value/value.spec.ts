import { StypLength } from './unit';
import { stypValuesEqual } from './value';

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
