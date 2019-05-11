import { StypDimension } from '../numeric';
import { StypTime, StypTimePt } from './time';

describe('StypTime', () => {
  it('has unitless zero', () => {
    expect(StypTime.zero.type).toBe('0');
  });
  it('constructs `StypTime` instance', () => {

    const time = StypTime.of(13, 'ms') as StypDimension<StypTime.Unit>;

    expect(time.type).toBe('dimension');
    expect(time.dim).toBe(StypTime);
    expect(time.val).toBe(13);
    expect(time.unit).toBe('ms');
  });
});

describe('StypTimePt', () => {
  it('has unitless zero', () => {
    expect(StypTimePt.zero.type).toBe('0');
  });
  it('constructs `StypTimePt` instance', () => {

    const time = StypTimePt.of(13, '%') as StypDimension<StypTimePt.Unit>;

    expect(time.type).toBe('dimension');
    expect(time.dim).toBe(StypTimePt);
    expect(time.val).toBe(13);
    expect(time.unit).toBe('%');
  });
});
