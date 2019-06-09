import { StypNumericStruct } from './';

/**
 * Structured unit-less zero value.
 *
 * Note that some dimensions require units (e.g. [frequency] or [resolution]). So this value is not acceptable by
 * them.
 *
 * @typeparam Unit Allowed unit type.
 *
 * [frequency]: https://developer.mozilla.org/en-US/docs/Web/CSS/frequency
 * [resolution]: https://developer.mozilla.org/en-US/docs/Web/CSS/resolution
 */
export interface StypZero<Unit extends string> extends StypNumericStruct<StypZero<Unit>, Unit> {

  readonly type: 0;

  mul(multiplier: number): this;

  div(divisor: number): this;

  negate(): this;

  toFormula(): string;

}
