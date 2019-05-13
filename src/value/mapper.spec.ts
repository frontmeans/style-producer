import { StypMapper } from './mapper';
import { StypFrequency, StypFrequencyPt, StypLength, StypLengthPt, StypTime, StypTimePt } from './unit';
import { StypValue } from './value';
import Mock = jest.Mock;

describe('StypMapper', () => {
  describe('scalar mapper', () => {

    interface Result {
      $value: string;
    }

    let mapping: StypMapper.Mapping<Result>;

    beforeEach(() => {
      mapping = { $value: 'default' };
    });

    it('maps absent value to default scalar value', () => {
      expect(StypMapper.map({}, mapping)).toEqual(mapping);
    });
    it('maps incompatible scalar value to default scalar value', () => {
      expect(StypMapper.map({ $value: 1 }, mapping)).toEqual(mapping);
    });
    it('maps structured value to default scalar value', () => {
      expect(StypMapper.map({ $value: StypLength.of(12, 'px') }, mapping)).toEqual(mapping);
    });
    it('retains scalar value of the same type', () => {

      const initial = { $value: 'initial' };

      expect(StypMapper.map(initial, mapping)).toEqual(initial);
    });
  });

  describe('unitless zero dimension kind mapper', () => {

    interface Result {
      $value?: StypLength;
    }

    let mapping: StypMapper.Mapping<Result>;

    beforeEach(() => {
      mapping = { $value: StypLength };
    });

    it('does not map absent value', () => {
      expect(StypMapper.map<Result>({}, mapping)).toEqual({});
    });
    it('removes scalar value', () => {
      expect(StypMapper.map<Result>({ $value: 'some' }, mapping)).toEqual({});
    });
    it('removes incompatible structured value', () => {
      expect(StypMapper.map<Result>({ $value: StypTime.of(10, 'ms') }, mapping)).toEqual({});
    });
    it('removes incompatible percent value', () => {
      expect(StypMapper.map<Result>({ $value: StypLengthPt.of(10, '%') }, mapping)).toEqual({});
    });
    it('retains same-dimension value', () => {

      const initial = { $value: StypLength.of(10, 'px') };

      expect(StypMapper.map<Result>(initial, mapping)).toEqual(initial);
    });
    it('retains compatible non-percent value', () => {

      const initial = { $value: StypLengthPt.of(10, 'px') };

      expect(StypMapper.map<Result>(initial, mapping)).toEqual(initial);
    });
    it('retains compatible percent value', () => {

      interface ResultPt {
        $value?: StypLengthPt;
      }

      const initial = { $value: StypTimePt.of(10, '%') };

      expect(StypMapper.map<ResultPt>(initial, { $value: StypLengthPt })).toEqual(initial);
    });
    it('retains zero value', () => {

      const initial = { $value: StypTime.zero };

      expect(StypMapper.map<Result>(initial, mapping)).toEqual({ $value: StypLength.zero });
    });
  });

  describe('unit zero dimension kind mapper', () => {

    interface Result {
      $value?: StypFrequency;
    }

    let mapping: StypMapper.Mapping<Result>;

    beforeEach(() => {
      mapping = { $value: StypFrequency };
    });

    it('does not map absent value', () => {
      expect(StypMapper.map<Result>({}, mapping)).toEqual({});
    });
    it('removes scalar value', () => {
      expect(StypMapper.map<Result>({ $value: 'some' }, mapping)).toEqual({});
    });
    it('removes incompatible structured value', () => {
      expect(StypMapper.map<Result>({ $value: StypTime.of(10, 'ms') }, mapping)).toEqual({});
    });
    it('removes incompatible percent value', () => {
      expect(StypMapper.map<Result>({ $value: StypFrequencyPt.of(10, '%') }, mapping)).toEqual({});
    });
    it('retains same-dimension value', () => {

      const initial = { $value: StypFrequency.of(10, 'kHz') };

      expect(StypMapper.map<Result>(initial, mapping)).toEqual(initial);
    });
    it('retains compatible non-percent value', () => {

      const initial = { $value: StypFrequencyPt.of(10, 'kHz') };

      expect(StypMapper.map<Result>(initial, mapping)).toEqual(initial);
    });
    it('retains compatible percent value', () => {

      interface ResultPt {
        $value?: StypFrequencyPt;
      }

      const initial = { $value: StypTimePt.of(10, '%') };

      expect(StypMapper.map<ResultPt>(initial, { $value: StypFrequencyPt })).toEqual(initial);
    });
    it('retains zero value', () => {

      const initial = { $value: StypTime.zero };

      expect(StypMapper.map<Result>(initial, mapping)).toEqual({ $value: StypFrequency.zero });
    });
  });

  describe('dimension mapper', () => {

    interface Result {
      $value: StypLength;
    }

    let mapping: StypMapper.Mapping<Result>;

    beforeEach(() => {
      mapping = { $value: StypLength.of(10, 'px') };
    });

    it('maps absent value to default one', () => {
      expect(StypMapper.map<Result>({}, mapping)).toEqual(mapping);
    });
    it('maps scalar value to default one', () => {
      expect(StypMapper.map({ $value: 1 }, mapping)).toEqual(mapping);
    });
    it('maps incompatible structured value to default one', () => {
      expect(StypMapper.map({ $value: StypTime.of(12, 'ms') }, mapping)).toEqual(mapping);
    });
    it('retains structured value of the same type', () => {

      const initial = { $value: StypLength.of(1, 'em') };

      expect(StypMapper.map(initial, mapping)).toEqual(initial);
    });
  });

  describe('mapper function', () => {

    interface Result {
      $value1?: StypLength;
      $value2: StypLength;
    }

    let mapping: StypMapper.Mapping<Result>;
    let mockMapper1: Mock<StypLength | undefined, [StypValue, StypMapper.Mapped<Result>, keyof Result]>;
    let mockMapper2: Mock<StypLength, [StypValue, StypMapper.Mapped<Result>, keyof Result]>;

    beforeEach(() => {
      mockMapper1 = jest.fn();
      mockMapper2 = jest.fn().mockImplementation(() => StypLength.zero);
      mapping = {
        $value1: mockMapper1,
        $value2: mockMapper2,
      };
    });

    it('maps value', () => {
      expect(
          StypMapper.map<Result>(
              {
                $value1: 'init1',
                $value2: 'init2',
              },
              mapping)
      ).toEqual({
        $value2: StypLength.zero,
      });
      expect(mockMapper1).toHaveBeenCalledWith('init1', expect.anything(), '$value1');
      expect(mockMapper2).toHaveBeenCalledWith('init2', expect.anything(), '$value2');
    });
    it('grants access to mapped values', () => {
      mockMapper1.mockImplementation((from, mapped, key) => mapped.get('$value2'));
      expect(
          StypMapper.map<Result>(
              {
                $value1: 'init1',
                $value2: 'init2',
              },
              mapping)
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
});
