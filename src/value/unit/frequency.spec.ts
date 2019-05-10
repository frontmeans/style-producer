import { stypFrequency, StypFrequency, stypFrequencyPt, StypFrequencyPt } from './frequency';

describe('stypFrequency()', () => {
  it('has zero with unit', () => {
    expect(StypFrequency.zero.type).toBe('dimension');
    expect(StypFrequency.zero.val).toBe(0);
    expect(StypFrequency.zero.unit).toBe('kHz');
  });
  it('constructs `StypFrequency` instance', () => {

    const frequency: StypFrequency = stypFrequency(44, 'kHz');

    expect(frequency.type).toBe('dimension');
    expect(frequency.dim).toBe(StypFrequency);
    expect(frequency.val).toBe(44);
    expect(frequency.unit).toBe('kHz');
  });
  it('constructs `StypFrequency` instance with zero value', () => {

    const frequency: StypFrequency = stypFrequency(0, 'kHz');

    expect(`${frequency}`).toBe('0kHz');
  });
});

describe('stypFrequencyPt()', () => {
  it('has zero with unit', () => {
    expect(StypFrequencyPt.zero.type).toBe('dimension');
    expect(StypFrequencyPt.zero.val).toBe(0);
    expect(StypFrequencyPt.zero.unit).toBe('kHz');
  });
  it('constructs `StypFrequencyPt` instance', () => {

    const frequency: StypFrequencyPt = stypFrequencyPt(13, '%');

    expect(frequency.type).toBe('dimension');
    expect(frequency.dim).toBe(StypFrequencyPt);
    expect(frequency.val).toBe(13);
    expect(frequency.unit).toBe('%');
  });
  it('constructs `StypFrequencyPt` instance with zero value', () => {

    const frequency: StypFrequencyPt = stypFrequencyPt(0, 'kHz');

    expect(`${frequency}`).toBe('0kHz');
  });
});
