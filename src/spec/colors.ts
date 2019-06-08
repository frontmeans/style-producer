import { StypHSL, StypRGB } from '../value/color';

export function rgbWhite(a = 1) {
  return new StypRGB({ r: 255, g: 255, b: 255, a });
}

export function hslWhite(a = 1): StypHSL {
  return new StypHSL({ a, h: 0, l: 100, s: 0 });
}

export function rgbGreen(a = 1): StypRGB {
  return new StypRGB({ r: 182, g: 204, b: 102, a });
}

export function hslGreen(a = 1): StypHSL {
  return new StypHSL({ h: 73, s: 50, l: 60, a });
}

export function rgbDarkGreen(a = 1): StypRGB {
  return new StypRGB({ r: 53, g: 136, b: 77, a });
}

export function hslDarkGreen(a = 1): StypHSL {
  return new StypHSL({ h: 137, s: 44, l: 37.1, a });
}

export function rgbRed(a = 1): StypRGB {
  return new StypRGB({ r: 204, g: 182, b: 102, a });
}

export function hslRed(a = 1): StypHSL {
  return new StypHSL({ h: 47, s: 50, l: 60, a });
}

export function rgbCrimson(a = 1): StypRGB {
  return new StypRGB({ r: 220, g: 20, b: 60, a });
}

export function hslCrimson(a = 1): StypHSL {
  return new StypHSL({ h: 348, s: 83, l: 47, a });
}

export function rgbBlue(a = 1): StypRGB {
  return new StypRGB({ r: 182, g: 102, b: 204, a });
}

export function hslBlue(a = 1): StypHSL {
  return new StypHSL({ h: 287, s: 50, l: 60, a });
}

export function rgbDarkBlue(a = 1): StypRGB {
  return new StypRGB({ r: 131, g: 51, b: 153, a });
}

export function hslDarkBlue(a = 1): StypHSL {
  return new StypHSL({ h: 287, s: 50, l: 40, a });
}

export function rgbBlack(a = 1): StypRGB {
  return new StypRGB({ r: 0, g: 0, b: 0, a });
}

export function rgbGray(a = 1): StypRGB {
  return new StypRGB({ r: 51, g: 51, b: 51, a });
}

export function rgbLighterGreen(a = 1): StypRGB {
  return new StypRGB({ r: 53, g: 179, b: 89, a });
}
