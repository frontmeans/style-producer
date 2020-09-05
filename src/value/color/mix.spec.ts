import { rgbBlack, rgbDarkGreen, rgbGray, rgbLighterGreen, rgbWhite } from '../../spec';
import { StypRGB } from './color';
import { mixStypColors } from './mix';

describe('mixStypColors', () => {
  it('produces the second color when mixes two colors with 0 weight', () => {

    const mix = mixStypColors(rgbWhite(), rgbGray(), 0);

    expect(`${mix}`).toBe(`${rgbGray()}`);
  });
  it('produces transparent second color when mixes two colors with 0 weight', () => {

    const mix = mixStypColors(rgbBlack(), rgbGray(0), 0);

    expect(`${mix}`).toBe(`${rgbGray(0)}`);
  });
  it('produces the first color when mixes two colors with 1 weight', () => {

    const mix = mixStypColors(rgbBlack(), rgbGray(), 1);

    expect(`${mix}`).toBe(`${rgbBlack()}`);
  });
  it('mixes colors', () => {

    const mix = mixStypColors(new StypRGB({ r: 0x36, g: 0xdd, b: 0x66 }), rgbGray(), 0.5);

    expect(`${mix}`).toBe(`${rgbDarkGreen()}`);
  });
  it('mixes colors with alpha', () => {
    const mix = mixStypColors(new StypRGB({ r: 0x36, g: 0xdd, b: 0x66 }), rgbGray(0.5), 0.5);
    expect(`${mix}`).toBe(`${rgbLighterGreen(0.75)}`);
  });
});
