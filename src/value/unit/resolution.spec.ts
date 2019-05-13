import { StypLength } from './length';
import { StypResolution } from './resolution';

describe('StypResolution', () => {
  it('has zero with unit', () => {
    expect(StypResolution.zero.type).toBe('dimension');
    expect(StypResolution.zero.val).toBe(0);
    expect(StypResolution.zero.unit).toBe('dpi');
  });
  describe('pt', () => {
    it('is undefined', () => {
      expect(StypResolution.pt).toBeUndefined();
    });
  });
  describe('noPt', () => {
    it('is StypResolution', () => {
      expect(StypResolution.noPt).toBe(StypResolution);
    });
  });
  describe('of', () => {
    it('constructs `StypResolution` instance', () => {

      const resolution = StypResolution.of(96, 'dpi');

      expect(resolution.type).toBe('dimension');
      expect(resolution.dim).toBe(StypResolution);
      expect(resolution.val).toBe(96);
      expect(resolution.unit).toBe('dpi');
    });
    it('constructs `StypResolution` instance with zero value', () => {

      const resolution: StypResolution = StypResolution.of(0, 'x');

      expect(`${resolution}`).toBe('0x');
    });
  });
  describe('toDim', () => {

    let resolution: StypResolution;

    beforeEach(() => {
      resolution = StypResolution.of(96, 'dpi');
    });

    it('converts to the same dimension', () => {
      expect(resolution.toDim(StypResolution)).toBe(resolution);
    });
    it('does not convert to incompatible dimension', () => {
      expect(resolution.toDim(StypLength)).toBeUndefined();
    });
  });
});
