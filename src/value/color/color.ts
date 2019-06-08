import { StypValue, StypValueStruct } from '../value';

export type StypColor = StypRGB | StypHSL;

export class StypRGB extends StypValueStruct<StypRGB> implements StypRGB.Coords {

  // noinspection JSMethodCanBeStatic
  get type(): 'rgb' {
    return 'rgb';
  }

  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  constructor(coords: StypRGB.Coords, opts?: StypValue.Opts) {
    super(opts);
    this.r = intCoord(coords.r, 255);
    this.g = intCoord(coords.g, 255);
    this.b = intCoord(coords.b, 255);
    this.a = coords.a != null ? coord(coords.a, 1) : 1;
  }

  get rgb(): this {
    return this;
  }

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

  by(value: StypValue): StypColor {
    return StypColor.by(value) || this;
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

  prioritize(priority: 'important' | undefined): StypRGB {
    return this.priority === priority ? this : new StypRGB(this, { priority });
  }

  toString(): string {

    const rgb = `${this.r}, ${this.g}, ${this.b}`;

    return this.a === 1 ? `rgb(${rgb})` : `rgba(${rgb}, ${this.a})`;

  }

}

export namespace StypRGB {

  export interface Coords {
    r: number;
    g: number;
    b: number;
    a?: number;
  }

}

export class StypHSL extends StypValueStruct<StypHSL> implements StypHSL.Coords {

  // noinspection JSMethodCanBeStatic
  get type(): 'hsl' {
    return 'hsl';
  }

  readonly h: number;
  readonly s: number;
  readonly l: number;
  readonly a: number;

  constructor(coords: StypHSL.Coords, opts?: StypValue.Opts) {
    super(opts);
    this.h = angleCoord(coords.h);
    this.s = coord(coords.s, 100);
    this.l = coord(coords.l, 100);
    this.a = coords.a != null ? coord(coords.a, 1) : 1;
  }

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

  get hsl(): this {
    return this;
  }

  by(value: StypValue): StypColor {
    return StypColor.by(value) || this;
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

  prioritize(priority: 'important' | undefined): StypHSL {
    return this.priority === priority ? this : new StypHSL(this, { priority });
  }

  toString(): string {

    const hsl = `${this.h}, ${this.s}%, ${this.l}%`;

    return this.a === 1 ? `hsl(${hsl})` : `hsla(${hsl}, ${this.a})`;
  }

}

export namespace StypHSL {

  export interface Coords {
    h: number;
    s: number;
    l: number;
    a?: number;
  }

}

export const StypColor = {

  by(value: StypValue): StypColor | undefined {
    if (typeof value === 'object' && (value.type === 'rgb' || value.type === 'hsl')) {
      return value;
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
