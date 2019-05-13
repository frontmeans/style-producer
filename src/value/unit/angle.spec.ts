import { StypDimension } from '../numeric';
import { StypAngle, StypAnglePt } from './angle';
import { StypLength } from './length';

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
  describe('of', () => {
    it('constructs `StypAngle` instance', () => {

      const angle = StypAngle.of(13, 'deg') as StypDimension<StypAngle.Unit>;

      expect(angle.type).toBe('dimension');
      expect(angle.dim).toBe(StypAngle);
      expect(angle.val).toBe(13);
      expect(angle.unit).toBe('deg');
    });
    it('constructs `StypZero` instance with zero value', () => {
      expect(StypAngle.of(0, 'deg').type).toBe(0);
    });
  });
  describe('toDim', () => {

    let angle: StypAngle;

    beforeEach(() => {
      angle = StypAngle.of(13, 'deg');
    });

    it('converts to the same dimension', () => {
      expect(angle.toDim(StypAngle)).toBe(angle);
    });
    it('converts to percent value', () => {
      expect(angle.toDim(StypAnglePt)).toBe(angle);
    });
    it('does not convert to incompatible dimension', () => {
      expect(angle.toDim(StypLength)).toBeUndefined();
    });
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
  describe('of', () => {
    it('constructs `StypAnglePt` instance', () => {

      const angle = StypAnglePt.of(13, '%') as StypDimension<StypAnglePt.Unit>;

      expect(angle.type).toBe('dimension');
      expect(angle.dim).toBe(StypAnglePt);
      expect(angle.val).toBe(13);
      expect(angle.unit).toBe('%');
    });
    it('constructs `StypZero` instance with zero value', () => {
      expect(StypAnglePt.of(0, 'deg').type).toBe(0);
    });
  });
  describe('toDim', () => {

    let angle: StypAnglePt;
    let anglePt: StypAnglePt;

    beforeEach(() => {
      angle = StypAnglePt.of(13, 'deg');
      anglePt = StypAnglePt.of(13, '%');
    });

    it('converts to the same dimension', () => {
      expect(angle.toDim(StypAnglePt)).toBe(angle);
    });
    it('converts to non-percent value', () => {
      expect(angle.toDim(StypAngle)).toBe(angle);
    });
    it('does not convert percent value to non-percent one', () => {
      expect(anglePt.toDim(StypLength)).toBeUndefined();
    });
    it('does not convert to incompatible dimension', () => {
      expect(angle.toDim(StypLength)).toBeUndefined();
    });
  });
});
