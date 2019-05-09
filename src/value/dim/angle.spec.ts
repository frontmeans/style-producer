import { stypAngle, StypAngle, stypAnglePt, StypAnglePt } from './angle';

describe('stypAngle()', () => {
  it('constructs `StypAngle` instance', () => {

    const angle: StypAngle = stypAngle(13, 'deg');

    expect(angle).toMatchObject({
      type: 'number',
      dim: 'deg',
      val: 13,
    });
  });
});

describe('stypAnglePt()', () => {
  it('constructs `StypAnglePt` instance', () => {

    const angle: StypAnglePt = stypAnglePt(13, '%');

    expect(angle).toMatchObject({
      type: 'number',
      dim: '%',
      val: 13,
    });
  });
});
