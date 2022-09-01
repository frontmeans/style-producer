import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Mock } from 'jest-mock';
import { StypMapper } from './mapper';
import {
  StypFrequency,
  StypFrequencyPt,
  StypLength,
  StypLengthPt,
  StypTime,
  StypTimePt,
} from './unit';
import { StypValue } from './value';

describe('StypMapper', () => {
  describe('scalar mapping', () => {
    interface Result {
      $value: string;
    }

    let mappings: StypMapper.Mappings<Result>;

    beforeEach(() => {
      mappings = { $value: 'default' };
    });

    it('maps absent value to default scalar value', () => {
      expect(StypMapper.map(mappings, {})).toEqual(mappings);
    });
    it('maps incompatible scalar value to default scalar value', () => {
      expect(StypMapper.map(mappings, { $value: 1 })).toEqual(mappings);
    });
    it('maps structured value to default scalar value', () => {
      expect(StypMapper.map(mappings, { $value: StypLength.of(12, 'px') })).toEqual(mappings);
    });
    it('retains scalar value of the same type', () => {
      const initial = { $value: 'initial' };

      expect(StypMapper.map(mappings, initial)).toEqual(initial);
    });
  });

  describe('unitless zero dimension kind mapping', () => {
    interface Result {
      $value?: StypLength | undefined;
    }

    let mappings: StypMapper.Mappings<Result>;

    beforeEach(() => {
      mappings = { $value: StypLength };
    });

    it('does not map absent value', () => {
      expect(StypMapper.map<Result>(mappings, {})).toEqual({});
    });
    it('removes scalar value', () => {
      expect(StypMapper.map<Result>(mappings, { $value: 'some' })).toEqual({});
    });
    it('removes incompatible structured value', () => {
      expect(StypMapper.map<Result>(mappings, { $value: StypTime.of(10, 'ms') })).toEqual({});
    });
    it('removes incompatible percent value', () => {
      expect(StypMapper.map<Result>(mappings, { $value: StypLengthPt.of(10, '%') })).toEqual({});
    });
    it('retains same-dimension value', () => {
      const initial = { $value: StypLength.of(10, 'px') };

      expect(StypMapper.map<Result>(mappings, initial)).toEqual(initial);
    });
    it('retains compatible non-percent value', () => {
      const initial = { $value: StypLengthPt.of(10, 'px') };

      expect(StypMapper.map<Result>(mappings, initial)).toEqual(initial);
    });
    it('retains compatible percent value', () => {
      interface ResultPt {
        $value?: StypLengthPt | undefined;
      }

      const initial = { $value: StypTimePt.of(10, '%') };

      expect(StypMapper.map<ResultPt>({ $value: StypLengthPt }, initial)).toEqual(initial);
    });
    it('retains zero value', () => {
      const initial = { $value: StypTime.zero };

      expect(StypMapper.map<Result>(mappings, initial)).toEqual({ $value: StypLength.zero });
    });
  });

  describe('unit zero dimension kind mapping', () => {
    interface Result {
      $value?: StypFrequency | undefined;
    }

    let mappings: StypMapper.Mappings<Result>;

    beforeEach(() => {
      mappings = { $value: StypFrequency };
    });

    it('does not map absent value', () => {
      expect(StypMapper.map<Result>(mappings, {})).toEqual({});
    });
    it('removes scalar value', () => {
      expect(StypMapper.map<Result>(mappings, { $value: 'some' })).toEqual({});
    });
    it('removes incompatible structured value', () => {
      expect(StypMapper.map<Result>(mappings, { $value: StypTime.of(10, 'ms') })).toEqual({});
    });
    it('removes incompatible percent value', () => {
      expect(StypMapper.map<Result>(mappings, { $value: StypFrequencyPt.of(10, '%') })).toEqual({});
    });
    it('retains same-dimension value', () => {
      const initial = { $value: StypFrequency.of(10, 'kHz') };

      expect(StypMapper.map<Result>(mappings, initial)).toEqual(initial);
    });
    it('retains compatible non-percent value', () => {
      const initial = { $value: StypFrequencyPt.of(10, 'kHz') };

      expect(StypMapper.map<Result>(mappings, initial)).toEqual(initial);
    });
    it('retains compatible percent value', () => {
      interface ResultPt {
        $value?: StypFrequencyPt | undefined;
      }

      const initial = { $value: StypTimePt.of(10, '%') };

      expect(StypMapper.map<ResultPt>({ $value: StypFrequencyPt }, initial)).toEqual(initial);
    });
    it('retains zero value', () => {
      const initial = { $value: StypTime.zero };

      expect(StypMapper.map<Result>(mappings, initial)).toEqual({ $value: StypFrequency.zero });
    });
  });

  describe('dimension mapping', () => {
    interface Result {
      $value: StypLength;
    }

    let mappings: StypMapper.Mappings<Result>;

    beforeEach(() => {
      mappings = { $value: StypLength.of(10, 'px') };
    });

    it('maps absent value to default one', () => {
      expect(StypMapper.map<Result>(mappings, {})).toEqual(mappings);
    });
    it('maps scalar value to default one', () => {
      expect(StypMapper.map(mappings, { $value: 1 })).toEqual(mappings);
    });
    it('maps incompatible structured value to default one', () => {
      expect(StypMapper.map(mappings, { $value: StypTime.of(12, 'ms') })).toEqual(mappings);
    });
    it('retains structured value of the same type', () => {
      const initial = { $value: StypLength.of(1, 'em') };

      expect(StypMapper.map(mappings, initial)).toEqual(initial);
    });
  });

  describe('mapping function', () => {
    interface Result {
      $value1?: StypLength | undefined;
      $value2: StypLength;
    }

    let mappings: StypMapper.Mappings<Result>;
    let mockMapper1: Mock<
      (
        source: StypValue,
        mapped: StypMapper.Mapped<Result>,
        key: keyof Result,
      ) => StypLength | undefined
    >;
    let mockMapper2: Mock<
      (source: StypValue, mapped: StypMapper.Mapped<Result>, key: keyof Result) => StypLength
    >;

    beforeEach(() => {
      mockMapper1 = jest.fn();
      mockMapper2 = jest.fn((_value, _mapped, _key) => StypLength.zero);
      mappings = {
        $value1: mockMapper1,
        $value2: mockMapper2,
      };
    });

    it('maps value', () => {
      expect(
        StypMapper.map<Result>(mappings, {
          $value1: 'init1',
          $value2: 'init2',
        }),
      ).toEqual({
        $value2: StypLength.zero,
      });
      expect(mockMapper1).toHaveBeenCalledWith('init1', expect.anything(), '$value1');
      expect(mockMapper2).toHaveBeenCalledWith('init2', expect.anything(), '$value2');
    });
    it('grants access to mapped values', () => {
      mockMapper1.mockImplementation((_from, mapped) => mapped.get('$value2'));
      expect(
        StypMapper.map<Result>(mappings, {
          $value1: 'init1',
          $value2: 'init2',
        }),
      ).toEqual({
        $value1: StypLength.zero,
        $value2: StypLength.zero,
      });
      expect(mockMapper1).toHaveBeenCalledWith('init1', expect.anything(), '$value1');
      expect(mockMapper1).toHaveBeenCalledTimes(1);
      expect(mockMapper2).toHaveBeenCalledWith('init2', expect.anything(), '$value2');
      expect(mockMapper2).toHaveBeenCalledTimes(1);
    });
  });

  describe('by', () => {
    it('creates mapper function', () => {
      interface Result {
        $value: string;
      }

      const mapping: StypMapper.Mappings<Result> = {
        $value(from) {
          return `${from}!`;
        },
      };
      const mapper = StypMapper.by(mapping);

      expect(mapper({ $value: 'value' })).toEqual({ $value: 'value!' });
    });
  });
});
