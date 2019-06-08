import { StypLength } from '../unit';
import { StypColor, StypHSL, StypRGB } from './color';

describe('StypRGB', () => {

  let coords: StypRGB.Coords;
  let value: StypRGB;

  beforeEach(() => {
    coords = { r: 255, g: 128, b: 64, a: 0.95 };
    value = new StypRGB(coords);
  });

  describe('constructor', () => {
    it('normalizes coordinates', () => {
      expect(new StypRGB({ ...coords, r: 256 }).r).toBe(255);
      expect(new StypRGB({ ...coords, r: -1 }).r).toBe(0);
      expect(new StypRGB({ ...coords, r: 11.11 }).r).toBe(11);
      expect(new StypRGB({ ...coords, g: 256 }).g).toBe(255);
      expect(new StypRGB({ ...coords, g: -1 }).g).toBe(0);
      expect(new StypRGB({ ...coords, g: 11.11 }).g).toBe(11);
      expect(new StypRGB({ ...coords, b: 256 }).b).toBe(255);
      expect(new StypRGB({ ...coords, b: -1 }).b).toBe(0);
      expect(new StypRGB({ ...coords, b: 22.22 }).b).toBe(22);
      expect(new StypRGB({ ...coords, a: 1.9 }).a).toBe(1);
      expect(new StypRGB({ ...coords, a: -1 }).a).toBe(0);
      expect(new StypRGB({ ...coords, a: 0.5 }).a).toBe(0.5);
    });
    it('defaults alpha to `1`', () => {
      expect(new StypRGB({ ...coords, a: undefined })).toMatchObject({ ...coords, a: 1 });
    });
  });

  describe('prioritize', () => {
    it('returns itself for the same priority', () => {
      expect(value.usual()).toBe(value);
    });
    it('changes priority', () => {

      const important = value.important();

      expect(important).not.toBe(value);
      expect(important.priority).toBe('important');
      expect(important).toMatchObject(coords);
      expect(important).toEqual(value.important());
    });
  });

  describe('rgb', () => {
    it('returns itself', () => {
      expect(value.rgb).toBe(value);
    });
  });

  describe('hsl', () => {
    it('converts white to HSL', () => {
      expect(`${rgbWhite().hsl}`).toBe(`${hslWhite()}`);
    });
    it('converts red to HSL', () => {
      expect(`${rgbRed(0.5).hsl}`).toBe(`${hslRed(0.5)}`);
    });
    it('converts green to HSL', () => {
      expect(`${rgbGreen(0.5).hsl}`).toBe(`${hslGreen(0.5)}`);
    });
    it('converts blue to HSL', () => {
      expect(`${rgbBlue(0.5).hsl}`).toBe(`${hslBlue(0.5)}`);
    });
    it('converts dark blue to HSL', () => {
      expect(`${rgbDarkBlue(0.5).hsl}`).toBe(`${hslDarkBlue(0.5)}`);
    });
    it('converts crimson to HSL', () => {
      expect(`${rgbCrimson(0.5).hsl}`).toBe(`${hslCrimson(0.5)}`);
    });
  });

  describe('is', () => {
    it('equals to itself', () => {
      expect(value.is(value)).toBe(true);
    });
    it('equals to color with the same coords', () => {
      expect(value.is(new StypRGB(coords))).toBe(true);
    });
    it('not equal to color with different coords', () => {
      expect(value.is(new StypRGB({ ...coords, r: 111 }))).toBe(false);
      expect(value.is(new StypRGB({ ...coords, g: 111 }))).toBe(false);
      expect(value.is(new StypRGB({ ...coords, b: 111 }))).toBe(false);
      expect(value.is(new StypRGB({ ...coords, a: 0.99 }))).toBe(false);
    });
    it('not equal to scalar value', () => {
      expect(value.is(123)).toBe(false);
    });
    it('not equal to different value type', () => {
      expect(value.is(new StypHSL({ h: 120, s: 50, l: 50 }))).toBe(false);
    });
    it('not equal to the same value with different priority', () => {
      expect(value.is(value.important())).toBe(false);
    });
    it('equals to the same value with the same priority', () => {
      expect(value.is(value.important().usual())).toBe(true);
    });
  });

  describe('by', () => {
    it('replaces by itself when not recognized', () => {
      expect(value.by(123)).toBe(value);
    });
    it('does not replace recognized color', () => {

      const other = new StypHSL({ h: 120, s: 50, l: 50 });

      expect(value.by(other)).toBe(other);
    });
  });

  describe('toString', () => {
    it('generates rgba() functional notation when alpha != 1', () => {
      expect(`${value}`).toBe('rgba(255, 128, 64, 0.95)');
    });
    it('generates rgb() functional notation when alpha == 1', () => {
      value = new StypRGB({ ...coords, a: undefined });
      expect(`${value}`).toBe('rgb(255, 128, 64)');
    });
  });
});

describe('StypHSL', () => {

  let coords: StypHSL.Coords;
  let value: StypHSL;

  beforeEach(() => {
    coords = { h: 240, s: 75, l: 75, a: 0.95 };
    value = new StypHSL(coords);
  });

  describe('constructor', () => {
    it('normalizes coordinates', () => {
      expect(new StypHSL({ ...coords, h: 366 }).h).toBe(6);
      expect(new StypHSL({ ...coords, h: -1 }).h).toBe(359);
      expect(new StypHSL({ ...coords, h: 11.11 }).h).toBe(11.11);
      expect(new StypHSL({ ...coords, s: 101 }).s).toBe(100);
      expect(new StypHSL({ ...coords, s: -1 }).s).toBe(0);
      expect(new StypHSL({ ...coords, s: 11.11 }).s).toBe(11.11);
      expect(new StypHSL({ ...coords, l: 103 }).l).toBe(100);
      expect(new StypHSL({ ...coords, l: -1 }).l).toBe(0);
      expect(new StypHSL({ ...coords, l: 22.22 }).l).toBe(22.22);
      expect(new StypHSL({ ...coords, a: 1.9 }).a).toBe(1);
      expect(new StypHSL({ ...coords, a: -1 }).a).toBe(0);
      expect(new StypHSL({ ...coords, a: 0.5 }).a).toBe(0.5);
    });
    it('defaults alpha to `1`', () => {
      expect(new StypHSL({ ...coords, a: undefined })).toMatchObject({ ...coords, a: 1 });
    });
  });

  describe('prioritize', () => {
    it('returns itself for the same priority', () => {
      expect(value.usual()).toBe(value);
    });
    it('changes priority', () => {

      const important = value.important();

      expect(important).not.toBe(value);
      expect(important.priority).toBe('important');
      expect(important).toMatchObject(coords);
      expect(important).toEqual(value.important());
    });
  });

  describe('rgb', () => {
    it('converts white to RGB', () => {
      expect(`${hslWhite().rgb}`).toBe(`${rgbWhite()}`);
    });
    it('converts red to RGB', () => {
      expect(`${hslRed(0.5).rgb}`).toBe(`${rgbRed(0.5)}`);
    });
    it('converts green to RGB', () => {
      expect(`${hslGreen(0.5).rgb}`).toBe(`${rgbGreen(0.5)}`);
    });
    it('converts blue to RGB', () => {
      expect(`${hslBlue(0.5).rgb}`).toBe(`${rgbBlue(0.5)}`);
    });
    it('converts dark blue to RGB', () => {
      expect(`${hslDarkBlue(0.5).rgb}`).toBe(`${rgbDarkBlue(0.5)}`);
    });
    it('converts dark green to RGB', () => {
      expect(`${hslDarkGreen(0.5).rgb}`).toBe(`${rgbDarkGreen(0.5)}`);
    });
  });

  describe('hsl', () => {
    it('returns itself', () => {
      expect(value.hsl).toBe(value);
    });
  });

  describe('is', () => {
    it('equals to itself', () => {
      expect(value.is(value)).toBe(true);
    });
    it('equals to color with the same coords', () => {
      expect(value.is(new StypHSL(coords))).toBe(true);
    });
    it('not equal to color with different coords', () => {
      expect(value.is(new StypHSL({ ...coords, h: 111 }))).toBe(false);
      expect(value.is(new StypHSL({ ...coords, s: 11 }))).toBe(false);
      expect(value.is(new StypHSL({ ...coords, l: 11 }))).toBe(false);
      expect(value.is(new StypHSL({ ...coords, a: 0.99 }))).toBe(false);
    });
    it('not equal to scalar value', () => {
      expect(value.is(123)).toBe(false);
    });
    it('not equal to different value type', () => {
      expect(value.is(new StypRGB({ r: 120, g: 50, b: 50 }))).toBe(false);
    });
    it('not equal to the same value with different priority', () => {
      expect(value.is(value.important())).toBe(false);
    });
    it('equals to the same value with the same priority', () => {
      expect(value.is(value.important().usual())).toBe(true);
    });
  });

  describe('by', () => {
    it('replaces by itself when not recognized', () => {
      expect(value.by(123)).toBe(value);
    });
    it('does not replace recognized color', () => {

      const other = new StypRGB({ r: 120, g: 50, b: 50 });

      expect(value.by(other)).toBe(other);
    });
  });

  describe('toString', () => {
    it('generates hsla() functional notation when alpha != 1', () => {
      expect(`${value}`).toBe('hsla(240, 75%, 75%, 0.95)');
    });
    it('generates hsl() functional notation when alpha == 1', () => {
      value = new StypHSL({ ...coords, a: undefined });
      expect(`${value}`).toBe('hsl(240, 75%, 75%)');
    });
  });
});

describe('StypColor', () => {
  describe('by', () => {
    it('recognizes RGB color', () => {

      const color = new StypRGB({ r: 110, g: 21, b: 44 });

      expect(StypColor.by(color)).toBe(color);
    });
    it('recognizes HSL color', () => {

      const color = new StypHSL({ h: 45, s: 90, l: 90 });

      expect(StypColor.by(color)).toBe(color);
    });
    it('does not recognize scalar value', () => {
      expect(StypColor.by(1)).toBeUndefined();
    });
    it('does not recognize incompatible value', () => {
      expect(StypColor.by(StypLength.zero)).toBeUndefined();
    });
  });
});

function rgbWhite(a = 1) {
  return new StypRGB({ r: 255, g: 255, b: 255, a });
}

function hslWhite(a = 1): StypHSL {
  return new StypHSL({ a, h: 0, l: 100, s: 0 });
}

function rgbGreen(a = 1): StypRGB {
  return new StypRGB({ r: 182, g: 204, b: 102, a });
}

function hslGreen(a = 1): StypHSL {
  return new StypHSL({ h: 73, s: 50, l: 60, a });
}

function rgbDarkGreen(a = 1): StypRGB {
  return new StypRGB({ r: 0, g: 102, b: 0, a });
}

function hslDarkGreen(a = 1): StypHSL {
  return new StypHSL({ h: 120, s: 100, l: 20, a });
}

function rgbRed(a = 1): StypRGB {
  return new StypRGB({ r: 204, g: 182, b: 102, a });
}

function hslRed(a = 1): StypHSL {
  return new StypHSL({ h: 47, s: 50, l: 60, a });
}

function rgbCrimson(a = 1): StypRGB {
  return new StypRGB({ r: 220, g: 20, b: 60, a });
}

function hslCrimson(a = 1): StypHSL {
  return new StypHSL({ h: 348, s: 83, l: 47, a });
}

function rgbBlue(a = 1): StypRGB {
  return new StypRGB({ r: 182, g: 102, b: 204, a });
}

function hslBlue(a = 1): StypHSL {
  return new StypHSL({ h: 287, s: 50, l: 60, a });
}

function rgbDarkBlue(a = 1): StypRGB {
  return new StypRGB({ r: 131, g: 51, b: 153, a });
}

function hslDarkBlue(a = 1): StypHSL {
  return new StypHSL({ h: 287, s: 50, l: 40, a });
}

function rgbBlack(a = 1): StypRGB {
  return new StypRGB({ r: 0, g: 0, b: 0, a });
}
