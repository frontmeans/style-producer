import { StypValue } from '../value';
import { StypDimension, StypNumeric } from './numeric';
import { isStypNumeric, StypDimension as StypDimension_ } from './numeric.impl';
import { StypZero } from './zero';
import { newStypZero } from './zero.impl';

/**
 * @internal
 */
export function unitlessZeroDimensionKind<TUnit extends string>(
    {
      pt,
      noPt,
    }: {
      pt: () => StypDimension.Kind.UnitlessZero<TUnit | '%'>;
      noPt: () => StypDimension.Kind.UnitlessZero<Exclude<TUnit, '%'>>;
    },
): StypDimension.Kind.UnitlessZero<TUnit> {

  const dimension: StypDimension.Kind.UnitlessZero<TUnit> = {

    get zero(): StypZero<TUnit> {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return zero;
    },

    get pt() {
      return pt();
    },

    get noPt() {
      return noPt();
    },

    of(val: number, unit: TUnit): StypDimension<TUnit> | StypZero<TUnit> {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      return val ? new StypDimension_(val, unit, { dim: this }) : zero;
    },

    by(source: StypValue): StypNumeric<TUnit> | undefined {
      if (!isStypNumeric(source)) {
        return;
      }
      return (source as StypNumeric<TUnit>).toDim(this);
    },

  };

  const zero = newStypZero<TUnit>(dimension);

  return dimension;
}

/**
 * @internal
 */
export function unitZeroDimensionKind<TUnit extends string>(
    {
      zeroUnit,
      withPercent,
      noPercent,
    }: {
      zeroUnit: TUnit;
      withPercent?: () => StypDimension.Kind.UnitZero<TUnit | '%'>;
      noPercent?: () => StypDimension.Kind.UnitZero<Exclude<TUnit, '%'>>;
    },
): StypDimension.Kind.UnitZero<TUnit> {

  const dim: StypDimension.Kind.UnitZero<TUnit> = {

    get pt() {
      return withPercent && withPercent();
    },

    get noPt() {
      return noPercent ? noPercent() : this as StypDimension.Kind.UnitZero<Exclude<TUnit, '%'>>;
    },

    get zero(): StypDimension<TUnit> {
      return zero;// eslint-disable-line @typescript-eslint/no-use-before-define
    },

    of(val: number, unit: TUnit): StypDimension<TUnit> {
      return new StypDimension_(val, unit, { dim: this });
    },

    by(source: StypValue): StypNumeric<TUnit, StypDimension<TUnit>> | undefined {
      if (!isStypNumeric(source)) {
        return;
      }
      return (source as StypNumeric<TUnit>).toDim(this) as StypNumeric<TUnit, StypDimension<TUnit>>;
    },

  };

  const zero = new StypDimension_(0, zeroUnit, { dim });

  return dim;
}
