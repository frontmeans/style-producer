/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { StypNumericStruct } from './';

/**
 * Structured unit-less zero value.
 *
 * Note that some dimensions require units (e.g.
 * [frequency](https://developer.mozilla.org/en-US/docs/Web/CSS/frequency)
 * or [resolution](https://developer.mozilla.org/en-US/docs/Web/CSS/resolution)). So this value is not acceptable by
 * them.
 *
 * @category CSS Value
 * @typeparam Unit  Allowed unit type.
 */
export interface StypZero<Unit extends string> extends StypNumericStruct<StypZero<Unit>, Unit> {

  readonly type: 0;

  mul(multiplier: number): this;

  div(divisor: number): this;

  negate(): this;

  toFormula(): string;

}
