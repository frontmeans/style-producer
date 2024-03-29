import { DoqryPicker, doqryPicker, DoqrySelector } from '@frontmeans/doqry';
import { NamespaceDef } from '@frontmeans/namespace-aliaser';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  AfterEvent,
  afterSupplied,
  afterThe,
  onSupplied,
  trackValue,
  ValueTracker,
} from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { itsEmpty } from '@proc7ts/push-iterator';
import { Mock } from 'jest-mock';
import { StypProperties } from './properties';
import { stypRoot } from './root';
import { StypRule, StypRuleList } from './rule';

describe('StypRule', () => {
  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let selector: DoqryPicker;
  let rule: StypRule;
  let mockSpec: Mock<(rule: StypRule) => AfterEvent<[StypProperties]>>;

  beforeEach(() => {
    selector = [{ e: 'test-element' }];
    mockSpec = jest.fn(_r => afterThe({}));
    rule = root.rules.add(selector, mockSpec);
  });

  describe('outer', () => {
    it('is `null` for root', () => {
      expect(root.outer).toBeNull();
    });
    it('is root for top-level descendant', () => {
      const nested = root.rules.add({ c: 'nested' });

      expect(nested.outer).toBe(root);
    });
    it('is root for top-level child', () => {
      const nested = root.rules.add(['>', { c: 'nested' }]);

      expect(nested.outer).toBe(root);
    });
    it('is `null` for top-level sibling', () => {
      const nested = root.rules.add(['+', { c: 'nested' }]);

      expect(nested.outer).toBeNull();
    });
    it('is parent for descendant', () => {
      const nested = rule.rules.add({ c: 'nested' });

      expect(nested.outer).toBe(rule);
      expect(rule.outer).toBe(root);
    });
    it('is parent for child', () => {
      const nested = rule.rules.add(['>', { c: 'nested' }]);

      expect(nested.outer).toBe(rule);
    });
    it('is grand parent for adjacent sibling', () => {
      const nested = rule.rules.add({ c: 'nested' });
      const sibling = nested.rules.add(['+', { c: 'sibling' }]);

      expect(sibling.outer).toBe(rule);
    });
    it('is grand parent for general sibling', () => {
      const nested = rule.rules.add({ c: 'nested' });
      const sibling = nested.rules.add(['~', { c: 'sibling' }]);

      expect(sibling.outer).toBe(rule);
    });
    it('handles multiple siblings', () => {
      const nested = rule.rules.add({ c: 'nested' });
      const sibling1 = nested.rules.add(['~', { c: 'sibling' }]);
      const sibling2 = sibling1.rules.add(['+', { c: 'sibling' }]);

      expect(sibling2.outer).toBe(rule);
    });
    it('caches the result', () => {
      const nested = rule.rules.add({ c: 'nested' });

      expect(nested.outer).toBe(nested.outer);
    });
  });

  describe('empty', () => {
    it('is `false`', () => {
      expect(rule.empty).toBe(false);
    });
  });

  describe('read', () => {
    let properties: StypProperties;

    beforeEach(() => {
      properties = { fontSize: '12px' };
      mockSpec.mockImplementation(() => afterThe(properties));
    });

    it('reads the spec', () => {
      const receiver = jest.fn();

      rule.read(receiver);

      expect(receiver).toHaveBeenCalledWith(properties);
      expect(mockSpec).toHaveBeenCalledWith(rule);
    });
    it('reflects updates received while no property receivers registered', async () => {
      const tracker = trackValue<StypProperties>({ $rev: 1 });

      rule.set(tracker);

      tracker.it = { $rev: 2 };

      expect(await rule.read).toEqual({ $rev: 2 });
    });
  });

  describe('[AfterEvent__symbol]', () => {
    it('is the same as `read`', () => {
      void expect(afterSupplied(rule)).toBe(rule.read);
    });
  });

  describe('set', () => {
    beforeEach(() => {
      rule = root.rules.add([{ e: 'element-1' }, '>', { e: 'element-1-1' }], { display: 'block' });
    });

    it('replaces properties', async () => {
      const replacement = { visibility: 'hidden' };

      rule.set(replacement);
      expect(await rule.read).toEqual(replacement);
    });
  });

  describe('add', () => {
    beforeEach(() => {
      rule = root.rules.add([{ e: 'element-1' }, '>', { e: 'element-1-1' }]);
    });

    let update: ValueTracker<StypProperties>;

    beforeEach(() => {
      update = trackValue({ display: 'block' });
      rule.add(update);
    });

    beforeEach(() => {
      root.rules.add([{ e: 'element-1', $: 'biz' }]);
    });

    it('applies update', async () => {
      expect(await rule.read).toEqual(update.it);
    });
    it('merges updated properties', async () => {
      const update2: StypProperties = { width: '100%' };

      rule.add(update2);

      expect(await rule.read).toEqual({ ...update.it, ...update2 });
    });
    it('sends updated properties', () => {
      const receiver = jest.fn();

      rule.read(receiver);
      receiver.mockClear();

      const update2 = { width: '90%' };

      rule.add(update2);

      expect(receiver).toHaveBeenCalledWith({ ...update.it, ...update2 });
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      rule = root.rules.add([{ e: 'element-1' }, '>', { e: 'element-1-1' }], { display: 'block' });
      rule.clear();
    });

    it('removes properties', async () => {
      expect(await rule.read).toEqual({});
    });
    it('makes rule empty', () => {
      expect(rule.empty).toBe(true);
    });
  });

  describe('rules', () => {
    describe('nested', () => {
      it('empty by default', () => {
        expect(itsEmpty(rule.rules.nested)).toBe(true);
      });
    });

    describe('self', () => {
      it('contains only rule itself', () => {
        expect([...rule.rules.self]).toEqual([rule]);
      });
    });

    describe('get', () => {
      it('returns undefined for absent rule', () => {
        expect(rule.rules.get({ c: 'absent' })).toBeUndefined();
      });
      it('returns itself for empty selector', () => {
        expect(rule.rules.get([])).toBe(rule);
      });
      it('returns target nested rule', () => {
        const nestedSelector: DoqrySelector = { c: 'nested' };
        const nested = rule.rules.add(nestedSelector);

        expect(rule.rules.get(nestedSelector)).toBe(nested);
      });
    });

    describe('add', () => {
      it('adds nested rule with combinator', () => {
        const subSelector = doqryPicker(['>', { c: 'nested' }]);
        const nested = rule.rules.add(subSelector);

        expect(ruleSelectors(rule.rules.nested)).toContain(nested.selector);
        expect(nested.selector).toEqual([...rule.selector, ...subSelector]);
        expect(nested.key).toEqual(subSelector);
      });
      it('stores rule in hierarchy', () => {
        expect(root.rules.get(rule.selector)).toBe(rule);
      });
      it('merges updated properties', async () => {
        const initial = { $init: 'abstract-value.ts' };

        mockSpec.mockImplementation(() => trackValue(initial).read);

        const update: StypProperties = { width: '100%' };

        root.rules.add(rule.selector, update);

        expect(await rule.read).toEqual({ ...initial, ...update });
      });
      it('adds nested rule', async () => {
        const update2: StypProperties = { width: '100%' };
        const updated2 = rule.rules.add({ e: 'element-1-2' }, update2);

        expect(root.rules.get(updated2.selector)).toBe(updated2);
        expect(await updated2.read).toEqual(update2);
      });
      it('sends rule list update', () => {
        const updateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();
        const rootUpdateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();

        rule.rules.onUpdate(updateReceiver);
        root.rules.onUpdate(rootUpdateReceiver);

        const subSelector = doqryPicker([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);
        const nested = rule.rules.add(subSelector);

        expect(updateReceiver).toHaveBeenCalled();
        expect(rootUpdateReceiver).toHaveBeenCalled();

        const [added, removed] = updateReceiver.mock.calls[0];
        const [addedToRoot, removedFromRoot] = updateReceiver.mock.calls[0];

        expect(removed).toHaveLength(0);
        expect(removedFromRoot).toBe(removed);
        expect(ruleSelectors(added)).toEqual([[...rule.selector, subSelector[0]], nested.selector]);
        expect(addedToRoot).toBe(added);
      });
      it('sends nested list update', () => {
        const updateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();
        const rootUpdateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();

        rule.rules.nested.onUpdate(updateReceiver);
        root.rules.nested.onUpdate(rootUpdateReceiver);

        const subSelector = doqryPicker([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);

        rule.rules.add(subSelector);

        expect(updateReceiver).toHaveBeenCalled();
        expect(rootUpdateReceiver).not.toHaveBeenCalled();

        const [added, removed] = updateReceiver.mock.calls[0];

        expect(removed).toHaveLength(0);
        expect(ruleSelectors(added)).toEqual([[...rule.selector, subSelector[0]]]);
      });
      it('updates rule list', () => {
        const listReceiver = jest.fn();
        const rootListReceiver = jest.fn();

        rule.rules.read(listReceiver);
        listReceiver.mockClear();
        root.rules.read(rootListReceiver);
        rootListReceiver.mockClear();

        const subSelector = doqryPicker([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);
        const nested = rule.rules.add(subSelector);

        expect(listReceiver).toHaveBeenCalledWith(rule.rules);
        expect(rootListReceiver).toHaveBeenCalledWith(root.rules);
        expect(ruleSelectors(rule.rules)).toEqual([
          rule.selector,
          [...rule.selector, subSelector[0]],
          nested.selector,
        ]);
      });
      it('updates nested list', () => {
        const listReceiver = jest.fn();
        const rootListReceiver = jest.fn();

        rule.rules.nested.read(listReceiver);
        listReceiver.mockClear();
        root.rules.nested.read(rootListReceiver);
        rootListReceiver.mockClear();

        const subSelector = doqryPicker([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);

        rule.rules.add(subSelector);

        expect(listReceiver).toHaveBeenCalledWith(rule.rules.nested);
        expect(rootListReceiver).not.toHaveBeenCalled();
        expect(ruleSelectors(rule.rules.nested)).toEqual([[...rule.selector, subSelector[0]]]);
      });
    });

    describe('grab', () => {
      let ns: NamespaceDef;
      let nested1: StypRule;
      let nested2: StypRule;

      beforeEach(() => {
        ns = new NamespaceDef('test/url', 'test');
        nested1 = rule.rules.add({ c: ['nested', 'nested-1'] });
        nested2 = nested1.rules.add({ c: ['nested', ['nested-2', ns]] });
      });

      it('contains matching rules', () => {
        const list = rule.rules.grab({ c: 'nested' });

        expect(ruleSelectors(list)).toEqual([nested1.selector, nested2.selector]);
      });
      it('tracks matching rule addition', () => {
        const list = rule.rules.grab({ c: 'nested' });
        const onUpdate = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();
        const receiver = jest.fn<(rules: StypRuleList) => void>();

        list.onUpdate(onUpdate);
        list.read(receiver);
        receiver.mockClear();

        const nested3 = rule.rules.add({ c: 'nested' });

        expect(onUpdate).toHaveBeenCalled();

        const [added, removed] = onUpdate.mock.calls[0];

        expect(ruleSelectors(added)).toEqual([nested3.selector]);
        expect(removed).toHaveLength(0);
        expect(receiver).toHaveBeenCalledWith(list);
        expect(ruleSelectors(list)).toEqual([nested1.selector, nested2.selector, nested3.selector]);
      });
      it('tracks matching rule removal', () => {
        const list = rule.rules.grab({ c: 'nested' });
        const onUpdate = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();
        const receiver = jest.fn<(rules: StypRuleList) => void>();

        list.onUpdate(onUpdate);
        list.read(receiver);
        receiver.mockClear();

        nested2.remove();

        expect(onUpdate).toHaveBeenCalled();

        const [added, removed] = onUpdate.mock.calls[0];

        expect(added).toHaveLength(0);
        expect(ruleSelectors(removed)).toEqual([nested2.selector]);
        expect(receiver).toHaveBeenCalledWith(list);
        expect(ruleSelectors(list)).toEqual([nested1.selector]);
      });
      it('reflects, but does not track modification when supply is cut off', () => {
        const list = rule.rules.grab({ c: 'nested' });
        const onUpdate = jest.fn();

        const supply = list.onUpdate(onUpdate);

        const nested3 = rule.rules.add({ c: ['nested', 'nested-3'] });

        expect(onUpdate).toHaveBeenCalled();
        onUpdate.mockClear();

        supply.off();

        const nested4 = rule.rules.add({ c: ['nested', 'nested-4'] });

        expect(onUpdate).not.toHaveBeenCalled();

        expect(ruleSelectors(list)).toEqual([
          nested1.selector,
          nested2.selector,
          nested3.selector,
          nested4.selector,
        ]);
      });
      it('ignores non-matching rule addition', () => {
        const list = rule.rules.grab({ c: 'nested' });
        const onUpdate = jest.fn();
        const receiver = jest.fn();

        list.onUpdate(onUpdate);
        list.read(receiver);
        receiver.mockClear();

        rule.rules.add({ c: 'nested-3' });

        expect(onUpdate).not.toHaveBeenCalled();
        expect(receiver).not.toHaveBeenCalled();
      });

      describe('list grab', () => {
        it('grabs matching rules', () => {
          const list = rule.rules.grab({ c: 'nested' }).grab({ c: ['nested-2', ns] });

          expect(ruleSelectors(list)).toEqual([nested2.selector]);
        });
      });

      describe('nested grab', () => {
        it('grabs matching nested rules', () => {
          const list = rule.rules.nested.grab({ c: 'nested' });

          expect(ruleSelectors(list)).toEqual([nested1.selector]);
        });
      });
    });

    describe('watch', () => {
      it('receives empty properties for absent rule', async () => {
        const sel: DoqrySelector = { c: 'watched' };

        expect(await rule.rules.watch(sel)).toEqual({});
      });
      it('receives existing rule properties', async () => {
        const sel: DoqrySelector = { c: 'watched' };

        rule.rules.add(sel, { $name: 'watched' });

        expect(await rule.rules.watch(sel)).toEqual({ $name: 'watched' });
      });
      it('receives added rule properties', async () => {
        const sel: DoqrySelector = { c: 'watched' };
        const watch = rule.rules.watch(sel);

        rule.rules.add(sel, { $name: 'watched' });

        expect(await watch).toEqual({ $name: 'watched' });
      });
      it('handles rule removal', async () => {
        const sel: DoqrySelector = { c: 'watched' };
        const watched = rule.rules.add(sel, { $name: 'watched' });
        const watch = rule.rules.watch(sel);
        const receiver = jest.fn();

        watch(receiver);
        watched.remove();

        expect(receiver).toHaveBeenCalledWith({});
        expect(await watch).toEqual({});
      });
      it('can be tracked when supply is cut off', async () => {
        const sel: DoqrySelector = { c: 'watched' };

        rule.rules.add(sel, { $name: 'watched' });

        const watch = rule.rules.watch(sel);
        const receiver = jest.fn();
        const supply = watch(receiver);

        expect(receiver).toHaveBeenCalledWith({ $name: 'watched' });

        supply.off();
        expect(await watch).toEqual({ $name: 'watched' });
      });
    });
  });

  describe('remove', () => {
    let subSelector: DoqryPicker;
    let nested: StypRule;

    beforeEach(() => {
      subSelector = doqryPicker([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);
      nested = rule.rules.add(subSelector);
    });

    it('sends rule list update', () => {
      const updateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();
      const rootUpdateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();

      onSupplied(rule.rules)(updateReceiver);
      onSupplied(root.rules)(rootUpdateReceiver);

      rule.rules.get(subSelector[0])!.remove();

      expect(updateReceiver).toHaveBeenCalled();
      expect(rootUpdateReceiver).toHaveBeenCalled();

      const [added, removed] = updateReceiver.mock.calls[0];
      const [addedToRoot, removedFromRoot] = updateReceiver.mock.calls[0];

      expect(added).toHaveLength(0);
      expect(addedToRoot).toBe(added);
      expect(ruleSelectors(removed)).toEqual([[...rule.selector, subSelector[0]], nested.selector]);
      expect(removedFromRoot).toBe(removed);
    });
    it('sends nested list update', () => {
      const updateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();
      const rootUpdateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();

      onSupplied(rule.rules.nested)(updateReceiver);
      onSupplied(root.rules.nested)(rootUpdateReceiver);

      rule.rules.get(subSelector[0])!.remove();

      expect(updateReceiver).toHaveBeenCalled();
      expect(rootUpdateReceiver).not.toHaveBeenCalled();

      const [added, removed] = updateReceiver.mock.calls[0];

      expect(added).toHaveLength(0);
      expect(ruleSelectors(removed)).toEqual([[...rule.selector, subSelector[0]]]);
    });
    it('sends self list update', () => {
      const updateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();
      const rootUpdateReceiver = jest.fn<(added: StypRule[], removed: StypRule[]) => void>();

      rule.rules.self.onUpdate(updateReceiver);
      onSupplied(root.rules.self)(rootUpdateReceiver);

      rule.remove();

      expect(updateReceiver).toHaveBeenCalled();
      expect(rootUpdateReceiver).not.toHaveBeenCalled();

      const [added, removed] = updateReceiver.mock.calls[0];

      expect(added).toHaveLength(0);
      expect(ruleSelectors(removed)).toEqual([rule.selector]);
      expect(itsEmpty(rule.rules.self)).toBe(true);
    });
    it('updates rule list', () => {
      const listReceiver = jest.fn();
      const rootListReceiver = jest.fn();

      afterSupplied(rule.rules)(listReceiver);
      listReceiver.mockClear();
      afterSupplied(root.rules)(rootListReceiver);
      rootListReceiver.mockClear();

      rule.rules.get(subSelector[0])!.remove();

      expect(listReceiver).toHaveBeenCalledWith(rule.rules);
      expect(rootListReceiver).toHaveBeenCalledWith(root.rules);
      expect(ruleSelectors(rule.rules)).toHaveLength(1);
    });
    it('updates nested list', () => {
      const listReceiver = jest.fn();
      const rootListReceiver = jest.fn();

      afterSupplied(rule.rules.nested)(listReceiver);
      listReceiver.mockClear();
      afterSupplied(root.rules.nested)(rootListReceiver);
      rootListReceiver.mockClear();

      rule.rules.get(subSelector[0])!.remove();

      expect(listReceiver).toHaveBeenCalledWith(rule.rules.nested);
      expect(rootListReceiver).not.toHaveBeenCalled();
      expect(ruleSelectors(rule.rules.nested)).toHaveLength(0);
    });
    it('cuts off events', () => {
      const whenDone = jest.fn();
      const reason = 'removal reason';

      nested.read(noop).whenOff(whenDone);

      rule.remove(reason);
      expect(whenDone).toHaveBeenCalledWith(reason);
    });
  });
});

describe('empty rule', () => {
  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let selector: DoqryPicker;
  let rule: StypRule;

  beforeEach(() => {
    selector = [{ c: ['nested'] }];
    rule = root.rules.add(selector);
  });

  it('is empty', () => {
    expect(rule.empty).toBe(true);
  });

  describe('rules.nested', () => {
    it('are empty', () => {
      expect(itsEmpty(rule.rules.nested)).toBe(true);
    });
  });

  describe('read', () => {
    it('sends empty properties', async () => {
      expect(await rule.read).toEqual({});
    });
  });

  describe('rule', () => {
    let subSelector: DoqryPicker;
    let subNested: StypRule;

    beforeEach(() => {
      subSelector = [{ c: ['sub-nested'] }];
      subNested = rule.rules.add(subSelector);
    });

    it('returns empty selector', () => {
      expect(subNested.empty).toBe(true);
    });
    it('returns itself when selector is empty', () => {
      expect(rule.rules.get([])).toBe(rule);
    });
    it('has the same root', () => {
      expect(subNested.root).toBe(root);
    });
    it('has nested selector', () => {
      expect(subNested.selector).toEqual([...selector, ...subSelector]);
    });
  });
});

function ruleSelectors(rules: Iterable<StypRule>): DoqryPicker[] {
  return [...rules].map(r => r.selector);
}
