import { StypDimension } from '../numeric';
import { stypTime, StypTime, stypTimePt, StypTimePt } from './time';

describe('stypTime()', () => {
  it('has unitless zero', () => {
    expect(StypTime.zero.type).toBe('0');
  });
  it('constructs `StypTime` instance', () => {

    const time = stypTime(13, 'ms') as StypDimension<StypTime.Unit>;

    expect(time.type).toBe('dimension');
    expect(time.dim).toBe(StypTime);
    expect(time.val).toBe(13);
    expect(time.unit).toBe('ms');
  });
});

describe('stypTimePt()', () => {
  it('has unitless zero', () => {
    expect(StypTimePt.zero.type).toBe('0');
  });
  it('constructs `StypTimePt` instance', () => {

    const time = stypTimePt(13, '%') as StypDimension<StypTimePt.Unit>;

    expect(time.type).toBe('dimension');
    expect(time.dim).toBe(StypTimePt);
    expect(time.val).toBe(13);
    expect(time.unit).toBe('%');
  });
});
