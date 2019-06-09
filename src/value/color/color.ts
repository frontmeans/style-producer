import { StypValue, StypValueStruct } from '../value';

/**
 * Structured [<color>] CSS property value.
 *
 * Colors are represented by either `rgb()`, or `hsl()` functional notations.
 *
 * [<color>]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
 */
export type StypColor = StypRGB | StypHSL;

/**
 * Structured color CSS property value base.
 */
export abstract class StypColorStruct<Self extends StypColorStruct<Self, Coords>, Coords>
    extends StypValueStruct<Self> {

  /**
   * Color value type corresponding to color coordinates. Either `rgb` or `hsl`
   */
  abstract readonly type: 'rgb' | 'hsl';

  /**
   * This color in RGB coordinates.
   */
  abstract readonly rgb: StypRGB;

  /**
   * This color in HSL coordinates.
   */
  abstract readonly hsl: StypHSL;

  /**
   * Constructs another color value with updated coordinates.
   *
   * @param coords Partial color coordinates to apply. Missing values are taken from this color.
   *
   * @returns Updated color value.
   */
  abstract set(coords: Partial<Coords>): Self;

}

/**
 * CSS property value representing [RGB color] in `rgb()` or `rgba()` functional notation.
 *
 * [RGB color]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#RGB_colors
 */
export class StypRGB extends StypColorStruct<StypRGB, StypRGB.Coords> implements StypRGB.Coords {

  // noinspection JSMethodCanBeStatic
  /**
   * `rgb` value type.
   */
  get type(): 'rgb' {
    return 'rgb';
  }

  /**
   * Red color value between `0` and `255`.
   */
  readonly r: number;

  /**
   * Green color value between `0` and `255`.
   */
  readonly g: number;

  /**
   * Blue color value between `0` and `255`.
   */
  readonly b: number;

  /**
   * Alpha value between `0` and `1`.
   */
  readonly a: number;

  /**
   * Constructs RGB color value.
   *
   * @param coords Color coordinates.
   * @param opts Construction options.
   */
  constructor(coords: StypRGB.Coords, opts?: StypValue.Opts) {
    super(opts);
    this.r = intCoord(coords.r, 255);
    this.g = intCoord(coords.g, 255);
    this.b = intCoord(coords.b, 255);
    this.a = coords.a != null ? coord(coords.a, 1) : 1;
  }

  /**
   * This color in RGB coordinates.
   *
   * Always the same as `this`.
   */
  get rgb(): this {
    return this;
  }

  /**
   * This color in HSL coordinates.
   */
  get hsl(): StypHSL {

    const { a } = this;
    const r = this.r * 100 / 255;
    const g = this.g * 100 / 255;
    const b = this.b * 100 / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = Math.round((max + min) / 2);

    if (max === min) {
      return new StypHSL({ h: 0, s: 0, l, a }, this);
    }

    const d = max - min;
    const s = Math.round(l > 50 ? d * 100 / (200 - max - min) : d * 100 / (max + min));
    let h: number;

    switch (max) {
      case r:
        h = ((g - b) / d) + (g < b ? 6 : 0);
        break;
      case g:
        h = ((b - r) / d) + 2;
        break;
      default:
        h = ((r - g) / d) + 4;
        break;
    }
    h *= 60;
    h = Math.round(h);

    return new StypHSL({ h, s, l, a }, this);
  }

  by(source: StypValue): StypColor {
    return StypColor.by(source) || this;
  }

  is(other: StypValue): boolean {
    return typeof other === 'object'
        && other.type === this.type
        && other.r === this.r
        && other.g === this.g
        && other.b === this.b
        && other.a === this.a
        && other.priority === this.priority;
  }

  prioritize(priority: number): StypRGB {
    return this.priority === priority ? this : new StypRGB(this, { priority });
  }

  set({ r = this.r, g = this.g, b = this.b, a = this.a }: Partial<StypRGB.Coords>): StypRGB {
    return new StypRGB({ r, g, b, a }, this);
  }

  toString(): string {

    const rgb = `${this.r}, ${this.g}, ${this.b}`;

    return this.a === 1 ? `rgb(${rgb})` : `rgba(${rgb}, ${this.a})`;

  }

}

export namespace StypRGB {

  /**
   * [RGB color] coordinates.
   *
   * [RGB color]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#RGB_colors
   */
  export interface Coords {

    /**
     * Red color value between `0` and `255`.
     */
    r: number;

    /**
     * Green color value between `0` and `255`.
     */
    g: number;

    /**
     * Blue color value between `0` and `255`.
     */
    b: number;

    /**
     * Alpha value between `0` and `1`. `1` (full opacity) by default.
     */
    a?: number;
  }

}

export class StypHSL extends StypColorStruct<StypHSL, StypHSL.Coords> implements StypHSL.Coords {

  // noinspection JSMethodCanBeStatic
  get type(): 'hsl' {
    return 'hsl';
  }

  /**
   * Hue angle value in degrees between `0` and `360`.
   */
  readonly h: number;

  /**
   * Saturation percentage.
   */
  readonly s: number;

  /**
   * Lightness percentage.
   */
  readonly l: number;

  /**
   * Alpha value between `0` and `1`.
   */
  readonly a: number;

  /**
   * Constructs HSL color value.
   *
   * @param coords Color coordinates.
   * @param opts Construction options.
   */
  constructor(coords: StypHSL.Coords, opts?: StypValue.Opts) {
    super(opts);
    this.h = angleCoord(coords.h);
    this.s = coord(coords.s, 100);
    this.l = coord(coords.l, 100);
    this.a = coords.a != null ? coord(coords.a, 1) : 1;
  }

  /**
   * This color in RGB coordinates.
   */
  get rgb(): StypRGB {

    const { a } = this;
    const s = this.s / 100;
    const l = this.l / 100;

    if (!s) {

      const c = l * 255;

      return new StypRGB({ r: c, g: c, b: c, a }, this);
    }

    const q = l < 0.5 ? l * (1 + s) : (l + s) - (l * s);
    const p = (2 * l) - q;
    const hueAsFraction = this.h / 360;

    return new StypRGB(
        {
          r: hueToRgb(p, q, hueAsFraction + (1.0 / 3.0)),
          g: hueToRgb(p, q, hueAsFraction),
          b: hueToRgb(p, q, hueAsFraction - (1.0 / 3.0)),
          a,
        },
        this);
  }

  /**
   * This color in HSL coordinates.
   *
   * Always the same as `this`.
   */
  get hsl(): this {
    return this;
  }

  by(source: StypValue): StypColor {
    return StypColor.by(source) || this;
  }

  is(other: StypValue): boolean {
    return typeof other === 'object'
        && other.type === this.type
        && other.h === this.h
        && other.s === this.s
        && other.l === this.l
        && other.a === this.a
        && other.priority === this.priority;
  }

  prioritize(priority: number): StypHSL {
    return this.priority === priority ? this : new StypHSL(this, { priority });
  }

  set({ h = this.h, s = this.s, l = this.l, a = this.a }: Partial<StypHSL.Coords>): StypHSL {
    return new StypHSL({ h, s, l, a }, this);
  }

  toString(): string {

    const hsl = `${this.h}, ${this.s}%, ${this.l}%`;

    return this.a === 1 ? `hsl(${hsl})` : `hsla(${hsl}, ${this.a})`;
  }

}

export namespace StypHSL {

  /**
   * [HSL color] coordinates.
   *
   * [HSL color]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#HSL_colors
   */
  export interface Coords {

    /**
     * Hue angle value in degrees.
     */
    h: number;

    /**
     * Saturation percentage.
     */
    s: number;

    /**
     * Lightness percentage.
     */
    l: number;

    /**
     * Alpha value between `0` and `1`. `1` (full opacity) by default.
     */
    a?: number;
  }

}

export const StypColor = {

  /**
   * Maps the given CSS property value to color. Defaults to `undefined` if mapping is not possible.
   *
   * This method allows to use a `StypColor` instance as [CSS property mapping][[StypMapper.Mapping]].
   *
   * @param source A raw property value that should be converted.
   *
   * @returns Mapped property value or `undefined`.
   */
  by(source: StypValue): StypColor | undefined {
    if (typeof source === 'object' && (source.type === 'rgb' || source.type === 'hsl')) {
      return source;
    }
    return;
  },

};

function angleCoord(value: number): number {
  value = value % 360;
  return value < 0 ? 360 + value : value;
}

function intCoord(value: number, max: number): number {
  return coord(Math.round(value), max);
}

function coord(value: number, max: number): number {
  return Math.max(Math.min(value, max), 0);
}

function hueToRgb(p: number, q: number, t: number) {

  let newT = t;

  if (newT < 0) {
    newT += 1;
  } else if (newT > 1) {
    newT -= 1;
  }

  let result;

  if (newT < 1.0 / 6.0) {
    result = p + ((q - p) * (6 * newT));
  } else if (newT < 1.0 / 2.0) {
    result = q;
  } else if (newT < 2.0 / 3.0) {
    result = p + (((q - p) * ((2.0 / 3.0) - newT)) * 6);
  } else {
    result = p;
  }

  return result * 255;
}
