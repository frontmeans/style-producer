import { describe, expect, it } from '@jest/globals';
import { StypDimension } from '../numeric';
import { StypTime, StypTimePt } from './time';

describe('StypTime', () => {
  it('has unitless zero', () => {
    expect(StypTime.zero.type).toBe(0);
  });
  describe('pt', () => {
    it('is StypTimePt', () => {
      expect(StypTime.pt).toBe(StypTimePt);
    });
  });
  describe('noPt', () => {
    it('is StypTime', () => {
      expect(StypTime.noPt).toBe(StypTime);
    });
  });
  describe('of', () => {
    it('constructs `StypTime` instance', () => {
      const time = StypTime.of(13, 'ms') as StypDimension<StypTime.Unit>;

      expect(time.type).toBe('dimension');
      expect(time.dim).toBe(StypTime);
      expect(time.val).toBe(13);
      expect(time.unit).toBe('ms');
    });
    it('constructs `StypZero` instance with zero value', () => {
      expect(StypTime.of(0, 'ms').type).toBe(0);
    });
  });
});

describe('StypTimePt', () => {
  it('has unitless zero', () => {
    expect(StypTimePt.zero.type).toBe(0);
  });
  describe('pt', () => {
    it('is StypTimePt', () => {
      expect(StypTimePt.pt).toBe(StypTimePt);
    });
  });
  describe('noPt', () => {
    it('is StypTime', () => {
      expect(StypTimePt.noPt).toBe(StypTime);
    });
  });
  describe('of', () => {
    it('constructs `StypTimePt` instance', () => {
      const time = StypTimePt.of(13, '%') as StypDimension<StypTimePt.Unit>;

      expect(time.type).toBe('dimension');
      expect(time.dim).toBe(StypTimePt);
      expect(time.val).toBe(13);
      expect(time.unit).toBe('%');
    });
    it('constructs `StypZero` instance with zero value', () => {
      expect(StypTimePt.of(0, 'ms').type).toBe(0);
    });
  });
});
