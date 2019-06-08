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

  constructor(
      coords: StypRGB.Coords,
      opts?: StypValue.Opts) {
    super(opts);
    this.r = intCoord(coords.r, 255);
    this.g = intCoord(coords.g, 255);
    this.b = intCoord(coords.b, 255);
    this.a = coords.a != null ? coord(coords.a, 1) : 1;
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

  constructor(
      coords: StypHSL.Coords,
      opts?: StypValue.Opts) {
    super(opts);
    this.h = angleCoord(coords.h);
    this.s = coord(coords.s, 100);
    this.l = coord(coords.l, 100);
    this.a = coords.a != null ? coord(coords.a, 1) : 1;
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
