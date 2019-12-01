import { StypValue } from '../value';
import { StypDimension, StypNumeric } from './numeric';
import { isStypNumeric, StypDimension as StypDimension_ } from './numeric.impl';
import { StypZero } from './zero';
import { newStypZero } from './zero.impl';

/**
 * @internal
 */
export function unitlessZeroDimensionKind<Unit extends string>(
    {
      pt,
      noPt,
    }: {
      pt: () => StypDimension.Kind.UnitlessZero<Unit | '%'>,
      noPt: () => StypDimension.Kind.UnitlessZero<Exclude<Unit, '%'>>,
    },
): StypDimension.Kind.UnitlessZero<Unit> {

  const dimension: StypDimension.Kind.UnitlessZero<Unit> = {

    get zero(): StypZero<Unit> {
      return zero;
    },

    get pt() {
      return pt();
    },

    get noPt() {
      return noPt();
    },

    of(val: number, unit: Unit): StypDimension<Unit> | StypZero<Unit> {
      return val ? new StypDimension_(val, unit, { dim: this }) : zero;
    },

    by(source: StypValue): StypNumeric<Unit> | undefined {
      if (!isStypNumeric(source)) {
        return;
      }

      const numeric: StypNumeric<any, any> = source;

      return numeric.toDim(this);
    },

  };

  const zero = newStypZero<Unit>(dimension);

  return dimension;
}

/**
 * @internal
 */
export function unitZeroDimensionKind<Unit extends string>(
    {
      zeroUnit,
      withPercent,
      noPercent,
    }: {
      zeroUnit: Unit,
      withPercent?: () => StypDimension.Kind.UnitZero<Unit | '%'>,
      noPercent?: () => StypDimension.Kind.UnitZero<Exclude<Unit, '%'>>,
    }): StypDimension.Kind.UnitZero<Unit> {

  const dimension: StypDimension.Kind.UnitZero<Unit> = {

    get pt() {
      return withPercent && withPercent();
    },

    get noPt() {
      return noPercent ? noPercent() : this as StypDimension.Kind.UnitZero<Exclude<Unit, '%'>>;
    },

    get zero(): StypDimension<Unit> {
      return zero;
    },

    of(val: number, unit: Unit): StypDimension<Unit> {
      return new StypDimension_(val, unit, { dim: this });
    },

    by(source: StypValue): StypNumeric<Unit, StypDimension<Unit>> | undefined {
      if (!isStypNumeric(source)) {
        return;
      }

      const numeric: StypNumeric<any, any> = source;

      return numeric.toDim(this);
    },

  };

  const zero = new StypDimension_(0, zeroUnit, { dim: dimension });

  return dimension;
}
