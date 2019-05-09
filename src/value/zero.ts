import { StypNumeric, StypNumericBase } from './numeric';
import { StypValueStruct } from './struct';
import { StypValue } from './value';

/**
 * Structured zero value.
 *
 * @typeparam Dim Allowed dimension type.
 */
export interface StypZero<Dim extends string> extends StypNumericBase<StypZero<Dim>, Dim> {

  readonly type: '0';

  mul(multiplier: number): this;

  div(divisor: number): this;

  negate(): this;

  toFormula(): string;

}

class Zero<Dim extends string> extends StypValueStruct<Zero<Dim>> implements StypZero<Dim> {

  constructor(opts?: { priority?: 'important'}) {
    super(opts);
  }

  get type(): '0' {
    return '0';
  }

  is(other: StypValue): boolean {
    if (this === other) {
      return true;
    }
    if (other === 0 || other === '0') {
      return !this.priority;
    }
    if (other === '0 !important') {
      return this.priority === 'important';
    }
    return false;
  }

  add(addendum: StypNumeric<Dim>): StypNumeric<Dim> {
    return addendum.prioritize(this.priority);
  }

  sub(subtrahend: StypNumeric<Dim>): StypNumeric<Dim> {
    return subtrahend.negate().prioritize(this.priority);
  }

  mul(multiplier: number): this {
    return this;
  }

  div(divisor: number): this {
    return this;
  }

  negate(): this {
    return this;
  }

  prioritize(priority: 'important' | undefined): Zero<Dim> {
    // tslint:disable-next-line:no-use-before-declare
    return priority ? stypImportantZero : stypZero;
  }

  toFormula(): string {
    return '0';
  }

  toString(): string {
    return this.priority ? '0 !important' : '0';
  }

}

export const stypZero: StypZero<any> = /*#__PURE__*/ new Zero<any>();
const stypImportantZero: StypZero<any> = /*#__PURE__*/ new Zero<any>({ priority: 'important' });