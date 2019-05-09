import { stypResolution, StypResolution } from './resolution';

describe('stypResolution()', () => {
  it('constructs `StypResolution` instance', () => {

    const resolution: StypResolution = stypResolution(96, 'dpi');

    expect(resolution).toMatchObject({
      type: 'number',
      unit: 'dpi',
      val: 96,
    });
  });
  it('constructs `StypResolution` instance with zero value', () => {

    const resolution: StypResolution = stypResolution(0, 'x');

    expect(`${resolution}`).toBe('0x');
  });
});
