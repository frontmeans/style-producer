import { stypResolution, StypResolution } from './resolution';

describe('stypResolution()', () => {
  it('has zero with unit', () => {
    expect(StypResolution.zero.type).toBe('dimension');
    expect(StypResolution.zero.val).toBe(0);
    expect(StypResolution.zero.unit).toBe('dpi');
  });
  it('constructs `StypResolution` instance', () => {

    const resolution = stypResolution(96, 'dpi');

    expect(resolution.type).toBe('dimension');
    expect(resolution.dim).toBe(StypResolution);
    expect(resolution.val).toBe(96);
    expect(resolution.unit).toBe('dpi');
  });
  it('constructs `StypResolution` instance with zero value', () => {

    const resolution: StypResolution = stypResolution(0, 'x');

    expect(`${resolution}`).toBe('0x');
  });
});
