import { StypDimension } from '../numeric';
import { stypAngle, StypAngle, stypAnglePt, StypAnglePt } from './angle';

describe('stypAngle()', () => {
  it('has unitless zero', () => {
    expect(StypAngle.zero.type).toBe('0');
  });
  it('constructs `StypAngle` instance', () => {

    const angle = stypAngle(13, 'deg') as StypDimension<StypAngle.Unit>;

    expect(angle.type).toBe('dimension');
    expect(angle.dim).toBe(StypAngle);
    expect(angle.val).toBe(13);
    expect(angle.unit).toBe('deg');
  });
});

describe('stypAnglePt()', () => {
  it('has unitless zero', () => {
    expect(StypAnglePt.zero.type).toBe('0');
  });
  it('constructs `StypAnglePt` instance', () => {

    const angle = stypAnglePt(13, '%') as StypDimension<StypAnglePt.Unit>;

    expect(angle.type).toBe('dimension');
    expect(angle.dim).toBe(StypAnglePt);
    expect(angle.val).toBe(13);
    expect(angle.unit).toBe('%');
  });
});
