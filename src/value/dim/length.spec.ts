import { stypLength, StypLength, StypLengthPt } from './length';

describe('stypLength()', () => {
  it('constructs `StypLength` instance', () => {

    const length: StypLength = stypLength(13, 'px');

    expect(length).toMatchObject({
      type: 'number',
      dim: 'px',
      val: 13,
    });
  });
});

describe('stypLengthPt()', () => {
  it('constructs `StypLengthPt` instance', () => {

    const length: StypLengthPt = stypLength(13, '%');

    expect(length).toMatchObject({
      type: 'number',
      dim: '%',
      val: 13,
    });
  });
});
