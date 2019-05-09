import { stypFrequency, StypFrequency, stypFrequencyPt, StypFrequencyPt } from './frequency';

describe('stypFrequency()', () => {
  it('constructs `StypFrequency` instance', () => {

    const frequency: StypFrequency = stypFrequency(44, 'kHz');

    expect(frequency).toMatchObject({
      type: 'number',
      unit: 'kHz',
      val: 44,
    });
  });
  it('constructs `StypFrequency` instance with zero value', () => {

    const frequency: StypFrequency = stypFrequency(0, 'kHz');

    expect(`${frequency}`).toBe('0kHz');
  });
});

describe('stypFrequencyPt()', () => {
  it('constructs `StypFrequencyPt` instance', () => {

    const frequency: StypFrequencyPt = stypFrequency(13, '%');

    expect(frequency).toMatchObject({
      type: 'number',
      unit: '%',
      val: 13,
    });
  });
  it('constructs `StypFrequencyPt` instance with zero value', () => {

    const frequency: StypFrequencyPt = stypFrequencyPt(0, 'kHz');

    expect(`${frequency}`).toBe('0kHz');
  });
});
