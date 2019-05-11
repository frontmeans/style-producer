import { StypFrequency, StypFrequencyPt } from './frequency';

describe('StypFrequency', () => {
  it('has zero with unit', () => {
    expect(StypFrequency.zero.type).toBe('dimension');
    expect(StypFrequency.zero.val).toBe(0);
    expect(StypFrequency.zero.unit).toBe('kHz');
  });
  describe('pt', () => {
    it('is StypFrequencyPt', () => {
      expect(StypFrequency.pt).toBe(StypFrequencyPt);
    });
  });
  describe('noPt', () => {
    it('is StypFrequency', () => {
      expect(StypFrequency.noPt).toBe(StypFrequency);
    });
  });
  it('constructs `StypFrequency` instance', () => {

    const frequency = StypFrequency.of(44, 'kHz');

    expect(frequency.type).toBe('dimension');
    expect(frequency.dim).toBe(StypFrequency);
    expect(frequency.val).toBe(44);
    expect(frequency.unit).toBe('kHz');
  });
  it('constructs `StypFrequency` instance with zero value', () => {

    const frequency = StypFrequency.of(0, 'kHz');

    expect(`${frequency}`).toBe('0kHz');
  });
});

describe('StypFrequencyPt', () => {
  it('has zero with unit', () => {
    expect(StypFrequencyPt.zero.type).toBe('dimension');
    expect(StypFrequencyPt.zero.val).toBe(0);
    expect(StypFrequencyPt.zero.unit).toBe('kHz');
  });
  describe('pt', () => {
    it('is StypFrequencyPt', () => {
      expect(StypFrequencyPt.pt).toBe(StypFrequencyPt);
    });
  });
  describe('noPt', () => {
    it('is StypFrequency', () => {
      expect(StypFrequencyPt.noPt).toBe(StypFrequency);
    });
  });
  it('constructs `StypFrequencyPt` instance', () => {

    const frequency = StypFrequencyPt.of(13, '%');

    expect(frequency.type).toBe('dimension');
    expect(frequency.dim).toBe(StypFrequencyPt);
    expect(frequency.val).toBe(13);
    expect(frequency.unit).toBe('%');
  });
  it('constructs `StypFrequencyPt` instance with zero value', () => {

    const frequency = StypFrequencyPt.of(0, 'kHz');

    expect(`${frequency}`).toBe('0kHz');
  });
});
