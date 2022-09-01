import { DoqrySelector } from '@frontmeans/doqry';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { afterSupplied, trackValue } from '@proc7ts/fun-events';
import { valueProvider } from '@proc7ts/primitives';
import { Mock } from 'jest-mock';
import { StypAnglePt, StypLength, StypMapper } from '../value';
import { stypRoot } from './root';
import { StypRule } from './rule';
import { RefStypRule, StypRuleRef } from './rule-ref';

describe('RefStypRule', () => {
  interface RuleProperties {
    $length: StypLength;
    $angle?: StypAnglePt | undefined;
  }

  let root: StypRule;
  let selector: DoqrySelector;
  let ref: StypRuleRef<RuleProperties>;

  beforeEach(() => {
    root = stypRoot();
    selector = { c: 'rule' };
    ref = RefStypRule.by(selector, { $length: StypLength.zero, $angle: StypAnglePt })(root);
  });

  let mockReceiver: Mock<(properties: RuleProperties) => void>;

  beforeEach(() => {
    mockReceiver = jest.fn();
    ref.read(mockReceiver);
  });

  it('maps to default values', () => {
    expect(mockReceiver).toHaveBeenCalledWith({ $length: StypLength.zero });
  });

  it('maps with constructed mappings', () => {
    mockReceiver.mockClear();

    const mockMap = jest.fn<(rule: StypRule) => StypMapper.Mappings<RuleProperties>>(
      valueProvider({ $length: StypLength.of(1, 'px') }));

    ref = RefStypRule.by(selector, mockMap)(root);
    mockReceiver = jest.fn();
    ref.read(mockReceiver);

    expect(mockMap).toHaveBeenCalledWith(root);
    expect(mockReceiver).toHaveBeenCalledWith({ $length: StypLength.of(1, 'px') });
  });

  it('maps with received mappings', () => {
    mockReceiver.mockClear();

    const mappings = trackValue<StypMapper.Mappings<RuleProperties>>({
      $length: StypLength.of(1, 'px'),
    });

    ref = RefStypRule.by(selector, mappings)(root);
    mockReceiver = jest.fn();
    ref.read(mockReceiver);

    expect(mockReceiver).toHaveBeenCalledWith({ $length: StypLength.of(1, 'px') });

    mockReceiver.mockClear();
    mappings.it = { $length: StypLength.of(2, 'px') };
    expect(mockReceiver).toHaveBeenCalledWith({ $length: StypLength.of(2, 'px') });
  });

  describe('set', () => {
    beforeEach(() => {
      mockReceiver.mockClear();
    });

    it('sets properties', () => {
      const update: Partial<RuleProperties> = { $angle: StypAnglePt.of(45, 'deg') };

      ref.set(update);
      expect(mockReceiver).toHaveBeenCalledWith({ $length: StypLength.zero, ...update });
    });
    it('replaces properties', () => {
      const update: RuleProperties = { $length: StypLength.of(12, 'px') };

      ref.set(update);
      expect(mockReceiver).toHaveBeenCalledWith(update);
    });
  });

  describe('add', () => {
    let initial: RuleProperties;

    beforeEach(() => {
      initial = { $length: StypLength.of(16, 'px').important() };
      ref.set(initial);
      mockReceiver.mockClear();
    });

    it('appends properties', () => {
      const update: RuleProperties = { $length: StypLength.of(1, 'rem').important() };

      ref.add(update);
      expect(mockReceiver).toHaveBeenCalledWith(update);
    });
    it('respects property importance', () => {
      const update: RuleProperties = { $length: StypLength.of(1, 'rem') };

      ref.add(update);
      expect(mockReceiver).not.toHaveBeenCalledWith(update);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      ref.set({ $length: StypLength.of(16, 'px'), $angle: StypAnglePt.of(25, '%') });
      mockReceiver.mockClear();
    });

    it('resets properties to default values', () => {
      ref.clear();
      expect(mockReceiver).toHaveBeenCalledWith({ $length: StypLength.zero });
    });
  });

  describe('[AfterEvent__symbol]', () => {
    it('is an alias of `read`', () => {
      void expect(afterSupplied(ref)).toBe(ref.read);
    });
  });
});
