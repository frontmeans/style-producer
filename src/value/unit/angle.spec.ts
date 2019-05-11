import { StypDimension } from '../numeric';
import { StypAngle, StypAnglePt } from './angle';

describe('StypAngle', () => {
  it('has unitless zero', () => {
    expect(StypAngle.zero.type).toBe(0);
  });
  describe('pt', () => {
    it('is StypAnglePt', () => {
      expect(StypAngle.pt).toBe(StypAnglePt);
    });
  });
  describe('noPt', () => {
    it('is StypAngle', () => {
      expect(StypAngle.noPt).toBe(StypAngle);
    });
  });
  it('constructs `StypAngle` instance', () => {

    const angle = StypAngle.of(13, 'deg') as StypDimension<StypAngle.Unit>;

    expect(angle.type).toBe('dimension');
    expect(angle.dim).toBe(StypAngle);
    expect(angle.val).toBe(13);
    expect(angle.unit).toBe('deg');
  });
});

describe('StypAnglePt', () => {
  it('has unitless zero', () => {
    expect(StypAnglePt.zero.type).toBe(0);
  });
  describe('pt', () => {
    it('is StypAnglePt', () => {
      expect(StypAnglePt.pt).toBe(StypAnglePt);
    });
  });
  describe('noPt', () => {
    it('is StypAngle', () => {
      expect(StypAnglePt.noPt).toBe(StypAngle);
    });
  });
  it('constructs `StypAnglePt` instance', () => {

    const angle = StypAnglePt.of(13, '%') as StypDimension<StypAnglePt.Unit>;

    expect(angle.type).toBe('dimension');
    expect(angle.dim).toBe(StypAnglePt);
    expect(angle.val).toBe(13);
    expect(angle.unit).toBe('%');
  });
});
