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
    }

  };

  const zero = newStypZero<Unit>(dim);

  return dim;

}

/**
 * @internal
 */
export function unitZeroDimensionKind<Unit extends string>(unit: Unit): StypDimension.Kind.UnitZero<Unit> {

  const dim: StypDimension.Kind.UnitZero<Unit> = {

    get zero(): StypDimension<Unit> {
      return zero; // tslint:disable-line:no-use-before-declare
    }

  };

  const zero = new StypDimension(0, unit, { dim: dim });

  return dim;
}
