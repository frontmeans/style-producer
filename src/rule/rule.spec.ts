import { StypRule } from './rule';
import { StypSelector, stypSelector } from '../selector';
import { stypRoot } from './root';
import {
  AfterEvent,
  AfterEvent__symbol,
  afterEventFrom,
  afterEventOf,
  onEventFrom,
  trackValue,
  ValueTracker
} from 'fun-events';
import { StypProperties } from './properties';
import { itsEmpty } from 'a-iterable';
import { noop } from 'call-thru';
import { ruleProperties } from '../spec';
import Mock = jest.Mock;

describe('StypRule', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let selector: StypSelector.Normalized;
  let rule: StypRule;
  let mockSpec: Mock<AfterEvent<[StypProperties]>, [StypRule]>;

  beforeEach(() => {
    selector = [{ e: 'test-element' }];
    mockSpec = jest.fn(r => afterEventOf({}));
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
      mockSpec.mockImplementation(() => afterEventOf(properties));
    });

    it('reads the spec', () => {
      expect(rule.read.kept).toEqual([properties]);
      expect(mockSpec).toHaveBeenCalledWith(rule);
    });
  });

  describe('[AfterEvent__symbol]', () => {
    it('is the same as `read`', () => {
      expect(rule[AfterEvent__symbol]).toBe(rule.read);
    });
  });

  describe('set', () => {

    beforeEach(() => {
      rule = root.rules.add([ { e: 'element-1' }, '>', { e: 'element-1-1' }], { display: 'block' });
    });

    it('replaces properties', async () => {

      const replacement = { visibility: 'hidden' };

      rule.set(replacement);
      expect(await ruleProperties(rule)).toEqual(replacement);
    });
  });

  describe('add', () => {

    beforeEach(() => {
      rule = root.rules.add([ { e: 'element-1' }, '>', { e: 'element-1-1' }]);
    });

    let update: ValueTracker<StypProperties>;

    beforeEach(() => {
      update = trackValue({ display: 'block' });
      rule.add(update.read);
    });

    let rule2: StypRule;

    beforeEach(() => {
      rule2 = root.rules.add([ { e: 'element-1', $: 'biz' }]);
    });

    it('updates existing rule', () => {
      expect(rule).toBe(rule);
    });
    it('stores rule in hierarchy', () => {
      expect(root.rules.get(rule.selector)).toBe(rule);
    });
    it('applies update', async () => {
      expect(await ruleProperties(rule)).toEqual(update.it);
    });
    it('merges updated properties', async () => {

      const update2: StypProperties = { width: '100%' };

      rule.add(update2);

      expect(await ruleProperties(rule)).toEqual({ ...update.it, ...update2 });
    });
    it('merges updated properties by `rules.add()', async () => {

      const update2: StypProperties = { width: '100%' };

      root.rules.add(rule.selector, update2);

      expect(await ruleProperties(rule)).toEqual({ ...update.it, ...update2 });
    });
    it('adds another rule', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = rule2.add(update2);

      expect(root.rules.get(rule2.selector)).toEqual(updated2);
      expect(await ruleProperties(updated2)).toEqual(update2);
    });
    it('adds nested rule', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = rule.rules.add({ e: 'element-1-2' }, update2);

      expect(root.rules.get(updated2.selector)).toBe(updated2);
      expect(await ruleProperties(updated2)).toEqual(update2);
    });
    it('sends updated properties', async () => {

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
      expect(await ruleProperties(rule)).toEqual({});
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

    describe('get', () => {
      it('returns undefined for absent rule', () => {
        expect(rule.rules.get({ c: 'absent' })).toBeUndefined();
      });
      it('returns itself for empty selector', () => {
        expect(rule.rules.get([])).toBe(rule);
      });
      it('returns target nested rule', () => {

        const nestedSelector: StypSelector = { c: 'nested' };
        const nested = rule.rules.add(nestedSelector);

        expect(rule.rules.get(nestedSelector)).toBe(nested);
      });
    });

    describe('add', () => {
      it('adds nested rule', () => {

        const subSelector = stypSelector(['>', { c: 'nested' }]);
        const nested = rule.rules.add(subSelector);

        expect(ruleSelectors(rule.rules.nested)).toContain(nested.selector);
        expect(nested.selector).toEqual([...rule.selector, ...subSelector]);
        expect(nested.key).toEqual(subSelector);
      });
      it('sends rule list update', () => {

        const updateReceiver = jest.fn();
        const rootUpdateReceiver = jest.fn();

        rule.rules.onUpdate(updateReceiver);
        root.rules.onUpdate(rootUpdateReceiver);

        const subSelector = stypSelector([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);
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

        const updateReceiver = jest.fn();
        const rootUpdateReceiver = jest.fn();

        rule.rules.nested.onUpdate(updateReceiver);
        root.rules.nested.onUpdate(rootUpdateReceiver);

        const subSelector = stypSelector([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);

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

        const subSelector = stypSelector([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);
        const nested = rule.rules.add(subSelector);

        expect(listReceiver).toHaveBeenCalledWith(rule.rules);
        expect(rootListReceiver).toHaveBeenCalledWith(root.rules);
        expect(ruleSelectors(rule.rules)).toEqual([rule.selector, [...rule.selector, subSelector[0]], nested.selector]);
      });
      it('updates nested list', () => {

        const listReceiver = jest.fn();
        const rootListReceiver = jest.fn();

        rule.rules.nested.read(listReceiver);
        listReceiver.mockClear();
        root.rules.nested.read(rootListReceiver);
        rootListReceiver.mockClear();

        const subSelector = stypSelector([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);

        rule.rules.add(subSelector);

        expect(listReceiver).toHaveBeenCalledWith(rule.rules.nested);
        expect(rootListReceiver).not.toHaveBeenCalled();
        expect(ruleSelectors(rule.rules.nested)).toEqual([[...rule.selector, subSelector[0]]]);
      });
    });

    describe('grab', () => {

      let nested1: StypRule;
      let nested2: StypRule;

      beforeEach(() => {
        nested1 = rule.rules.add({ c: ['nested', 'nested-1'] });
        nested2 = nested1.rules.add({ c: ['nested', 'nested-2'] });
      });

      it('contains matching rules', () => {

        const list = rule.rules.grab({ c: 'nested' });

        expect(ruleSelectors(list)).toEqual([nested1.selector, nested2.selector]);
      });
      it('tracks matching rule addition', () => {

        const list = rule.rules.grab({ c: 'nested' });
        const onUpdate = jest.fn();
        const receiver = jest.fn();

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
        const onUpdate = jest.fn();
        const receiver = jest.fn();

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
      it('reflects, but does not track modification when interest lost', () => {

        const list = rule.rules.grab({ c: 'nested' });
        const onUpdate = jest.fn();

        const interest = list.onUpdate(onUpdate);

        const nested3 = rule.rules.add({ c: ['nested', 'nested-3'] });

        expect(onUpdate).toHaveBeenCalled();
        onUpdate.mockClear();

        interest.off();

        const nested4 = rule.rules.add({ c: ['nested', 'nested-4'] });
        expect(onUpdate).not.toHaveBeenCalled();

        expect(ruleSelectors(list)).toEqual([nested1.selector, nested2.selector, nested3.selector, nested4.selector]);
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

          const list = rule.rules.grab({ c: 'nested' }).grab({ c: 'nested-2' });

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
  });

  describe('remove', () => {

    let subSelector: StypSelector.Normalized;
    let nested: StypRule;

    beforeEach(() => {
      subSelector = stypSelector([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);
      nested = rule.rules.add(subSelector);
    });

    it('sends rule list update', () => {

      const updateReceiver = jest.fn();
      const rootUpdateReceiver = jest.fn();

      onEventFrom(rule.rules)(updateReceiver);
      onEventFrom(root.rules)(rootUpdateReceiver);

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

      const updateReceiver = jest.fn();
      const rootUpdateReceiver = jest.fn();

      onEventFrom(rule.rules.nested)(updateReceiver);
      onEventFrom(root.rules.nested)(rootUpdateReceiver);

      rule.rules.get(subSelector[0])!.remove();

      expect(updateReceiver).toHaveBeenCalled();
      expect(rootUpdateReceiver).not.toHaveBeenCalled();

      const [added, removed] = updateReceiver.mock.calls[0];

      expect(added).toHaveLength(0);
      expect(ruleSelectors(removed)).toEqual([[...rule.selector, subSelector[0]]]);
    });
    it('updates rule list', () => {

      const listReceiver = jest.fn();
      const rootListReceiver = jest.fn();

      afterEventFrom(rule.rules)(listReceiver);
      listReceiver.mockClear();
      afterEventFrom(root.rules)(rootListReceiver);
      rootListReceiver.mockClear();

      rule.rules.get(subSelector[0])!.remove();

      expect(listReceiver).toHaveBeenCalledWith(rule.rules);
      expect(rootListReceiver).toHaveBeenCalledWith(root.rules);
      expect(ruleSelectors(rule.rules)).toHaveLength(1);
    });
    it('updates nested list', () => {

      const listReceiver = jest.fn();
      const rootListReceiver = jest.fn();

      afterEventFrom(rule.rules.nested)(listReceiver);
      listReceiver.mockClear();
      afterEventFrom(root.rules.nested)(rootListReceiver);
      rootListReceiver.mockClear();

      rule.rules.get(subSelector[0])!.remove();

      expect(listReceiver).toHaveBeenCalledWith(rule.rules.nested);
      expect(rootListReceiver).not.toHaveBeenCalled();
      expect(ruleSelectors(rule.rules.nested)).toHaveLength(0);
    });
    it('exhaust events', () => {

      const whenDone = jest.fn();
      const reason = 'removal reason';

      nested.read(noop).whenDone(whenDone);

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

  let selector: StypSelector.Normalized;
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
      expect(await ruleProperties(rule)).toEqual({});
    });
  });

  describe('rule', () => {

    let subSelector: StypSelector.Normalized;
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

function ruleSelectors(rules: Iterable<StypRule>): StypSelector.Normalized[] {
  return [...rules].map(r => r.selector);
}
