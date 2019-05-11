import { StypDimension } from './numeric';
import { StypZero } from './zero';
import { newStypZero } from './zero.impl';

/**
 * @internal
 */
export function unitlessZeroDimensionKind<Unit extends string>(): StypDimension.Kind.UnitlessZero<Unit> {

  const dim: StypDimension.Kind.UnitlessZero<Unit> = {

    get zero(): StypZero<Unit> {
      return zero; // tslint:disable-line:no-use-before-declare
    },

    of(val: number, unit: Unit): StypDimension<Unit> | StypZero<Unit> {
      return val ? new StypDimension(val, unit, { dim: this }) : zero; // tslint:disable-line:no-use-before-declare
    },

  };

  const zero = newStypZero<Unit>(dim);

  return dim;

}

/**
 * @internal
 */
export function unitZeroDimensionKind<Unit extends string>(zeroUnit: Unit): StypDimension.Kind.UnitZero<Unit> {

  const dim: StypDimension.Kind.UnitZero<Unit> = {

    get zero(): StypDimension<Unit> {
      return zero; // tslint:disable-line:no-use-before-declare
    },

    of(val: number, unit: Unit): StypDimension<Unit> {
      return new StypDimension(val, unit, { dim: this });
    },

  };

  const zero = new StypDimension(0, zeroUnit, { dim: dim });

  return dim;
}
