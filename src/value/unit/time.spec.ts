import { stypTime, StypTime, stypTimePt, StypTimePt } from './time';

describe('stypTime()', () => {
  it('constructs `StypTime` instance', () => {

    const time: StypTime = stypTime(13, 'ms');

    expect(time).toMatchObject({
      type: 'number',
      unit: 'ms',
      val: 13,
    });
  });
});

describe('stypTimePt()', () => {
  it('constructs `StypTimePt` instance', () => {

    const time: StypTimePt = stypTimePt(13, '%');

    expect(time).toMatchObject({
      type: 'number',
      unit: '%',
      val: 13,
    });
  });
});
