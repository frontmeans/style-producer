import { StypRule, StypRuleList } from './rule';
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
import Mock = jest.Mock;
import { noop } from 'call-thru';

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
    rule = root.addRule(selector, mockSpec);
  });

  describe('empty', () => {
    it('is `false`', () => {
      expect(rule.empty).toBe(false);
    });
  });

  describe('rules', () => {
    it('empty by default', () => {
      expect(itsEmpty(rule.nested)).toBe(true);
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

  describe('rule', () => {
    it('returns undefined for absent rule', () => {
      expect(rule.rule({ c: 'absent' })).toBeUndefined();
    });
    it('returns itself for empty selector', () => {
      expect(rule.rule('')).toBe(rule);
    });
    it('returns target nested rule', () => {

      const nestedSelector: StypSelector = { c: 'nested' };
      const nested = rule.addRule(nestedSelector);

      expect(rule.rule(nestedSelector)).toBe(nested);
    });
  });

  describe('set', () => {

    beforeEach(() => {
      rule = root.addRule([ { e: 'element-1' }, '>', { e: 'element-1-1' }], { display: 'block' });
    });

    it('replaces properties', async () => {

      const replacement = { visibility: 'hidden' };

      rule.set(replacement);
      expect(await receiveProperties(rule)).toEqual(replacement);
    });
  });

  describe('add', () => {

    beforeEach(() => {
      rule = root.addRule([ { e: 'element-1' }, '>', { e: 'element-1-1' }]);
    });

    let update: ValueTracker<StypProperties>;

    beforeEach(() => {
      update = trackValue({ display: 'block' });
      rule.add(update.read);
    });

    let rule2: StypRule;

    beforeEach(() => {
      rule2 = root.addRule([ { e: 'element-1', $: 'biz' }]);
    });

    it('updates existing rule', () => {
      expect(rule).toBe(rule);
    });
    it('stores rule rule in hierarchy', () => {
      expect(root.rule(rule.selector)).toBe(rule);
    });
    it('applies update', async () => {
      expect(await receiveProperties(rule)).toEqual(update.it);
    });
    it('merges updated properties', async () => {

      const update2: StypProperties = { width: '100%' };

      rule.add(update2);

      expect(await receiveProperties(rule)).toEqual({ ...update.it, ...update2 });
    });
    it('merges updated properties by `addRule', async () => {

      const update2: StypProperties = { width: '100%' };

      root.addRule(rule.selector, update2);

      expect(await receiveProperties(rule)).toEqual({ ...update.it, ...update2 });
    });
    it('adds another rule', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = rule2.add(update2);

      expect(root.rule(rule2.selector)).toEqual(updated2);
      expect(await receiveProperties(updated2)).toEqual(update2);
    });
    it('adds nested rule', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = rule.addRule({ e: 'element-1-2' }, update2);

      expect(root.rule(updated2.selector)).toBe(updated2);
      expect(await receiveProperties(updated2)).toEqual(update2);
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
      rule = root.addRule([{ e: 'element-1' }, '>', { e: 'element-1-1' }], { display: 'block' });
      rule.clear();
    });

    it('removes properties', async () => {
      expect(await receiveProperties(rule)).toEqual({});
    });
    it('makes rule empty', () => {
      expect(rule.empty).toBe(true);
    });
  });

  describe('addRule', () => {
    it('adds nested rule', () => {

      const subSelector = stypSelector(['>', { c: 'nested' }]);
      const nested = rule.addRule(subSelector);

      expect(ruleSelectors(rule.nested)).toContain(nested.selector);
      expect(nested.selector).toEqual([...rule.selector, ...subSelector]);
      expect(nested.key).toEqual(subSelector);
    });
    it('sends rule list update', () => {

      const updateReceiver = jest.fn();
      const rootUpdateReceiver = jest.fn();

      rule.rules.onUpdate(updateReceiver);
      root.rules.onUpdate(rootUpdateReceiver);

      const subSelector = stypSelector([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);
      const nested = rule.addRule(subSelector);

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

      rule.nested.onUpdate(updateReceiver);
      root.nested.onUpdate(rootUpdateReceiver);

      const subSelector = stypSelector([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);

      rule.addRule(subSelector);

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
      const nested = rule.addRule(subSelector);

      expect(listReceiver).toHaveBeenCalledWith(rule.rules);
      expect(rootListReceiver).toHaveBeenCalledWith(root.rules);
      expect(ruleSelectors(rule.rules)).toEqual([rule.selector, [...rule.selector, subSelector[0]], nested.selector]);
    });
    it('updates nested list', () => {

      const listReceiver = jest.fn();
      const rootListReceiver = jest.fn();

      rule.nested.read(listReceiver);
      listReceiver.mockClear();
      root.nested.read(rootListReceiver);
      rootListReceiver.mockClear();

      const subSelector = stypSelector([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);

      rule.addRule(subSelector);

      expect(listReceiver).toHaveBeenCalledWith(rule.nested);
      expect(rootListReceiver).not.toHaveBeenCalled();
      expect(ruleSelectors(rule.nested)).toEqual([[...rule.selector, subSelector[0]]]);
    });
  });

  describe('remove', () => {

    let subSelector: StypSelector.Normalized;
    let nested: StypRule;

    beforeEach(() => {
      subSelector = stypSelector([{ c: 'nested' }, '>', { c: 'nested-deeper' }]);
      nested = rule.addRule(subSelector);
    });

    it('sends rule list update', () => {

      const updateReceiver = jest.fn();
      const rootUpdateReceiver = jest.fn();

      onEventFrom(rule.rules)(updateReceiver);
      onEventFrom(root.rules)(rootUpdateReceiver);

      rule.rule(subSelector[0])!.remove();

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

      onEventFrom(rule.nested)(updateReceiver);
      onEventFrom(root.nested)(rootUpdateReceiver);

      rule.rule(subSelector[0])!.remove();

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

      rule.rule(subSelector[0])!.remove();

      expect(listReceiver).toHaveBeenCalledWith(rule.rules);
      expect(rootListReceiver).toHaveBeenCalledWith(root.rules);
      expect(ruleSelectors(rule.rules)).toHaveLength(1);
    });
    it('updates nested list', () => {

      const listReceiver = jest.fn();
      const rootListReceiver = jest.fn();

      afterEventFrom(rule.nested)(listReceiver);
      listReceiver.mockClear();
      afterEventFrom(root.nested)(rootListReceiver);
      rootListReceiver.mockClear();

      rule.rule(subSelector[0])!.remove();

      expect(listReceiver).toHaveBeenCalledWith(rule.nested);
      expect(rootListReceiver).not.toHaveBeenCalled();
      expect(ruleSelectors(rule.nested)).toHaveLength(0);
    });
    it('exhaust events', () => {

      const whenDone = jest.fn();
      const reason = 'removal reason';

      nested.read(noop).whenDone(whenDone);

      rule.remove(reason);
      expect(whenDone).toHaveBeenCalledWith(reason);
    });
  });

  describe('grab', () => {

    let nested1: StypRule;
    let nested2: StypRule;

    beforeEach(() => {
      nested1 = rule.addRule({ c: ['nested', 'nested-1'] });
      nested2 = nested1.addRule({ c: ['nested', 'nested-2'] });
    });

    it('returns all rules for empty query', () => {
      expect(rule.grab({})).toBe(rule.rules);
    });

    it('contains matching rules', () => {

      const list = rule.grab({ c: 'nested' });

      expect(ruleSelectors(list)).toEqual([nested1.selector, nested2.selector]);
    });
    it('tracks matching rule addition', () => {

      const list = rule.grab({ c: 'nested' });
      const onUpdate = jest.fn();
      const receiver = jest.fn();

      list.onUpdate(onUpdate);
      list.read(receiver);
      receiver.mockClear();

      const nested3 = rule.addRule({ c: 'nested' });

      expect(onUpdate).toHaveBeenCalled();

      const [added, removed] = onUpdate.mock.calls[0];

      expect(ruleSelectors(added)).toEqual([nested3.selector]);
      expect(removed).toHaveLength(0);
      expect(receiver).toHaveBeenCalledWith(list);
      expect(ruleSelectors(list)).toEqual([nested1.selector, nested2.selector, nested3.selector]);
    });
    it('tracks matching rule removal', () => {

      const list = rule.grab({ c: 'nested' });
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

      const list = rule.grab({ c: 'nested' });
      const onUpdate = jest.fn();

      const interest = list.onUpdate(onUpdate);

      const nested3 = rule.addRule({ c: ['nested', 'nested-3'] });

      expect(onUpdate).toHaveBeenCalled();
      onUpdate.mockClear();

      interest.off();

      const nested4 = rule.addRule({ c: ['nested', 'nested-4'] });
      expect(onUpdate).not.toHaveBeenCalled();

      expect(ruleSelectors(list)).toEqual([nested1.selector, nested2.selector, nested3.selector, nested4.selector]);
    });
    it('ignores non-matching rule addition', () => {

      const list = rule.grab({ c: 'nested' });
      const onUpdate = jest.fn();
      const receiver = jest.fn();

      list.onUpdate(onUpdate);
      list.read(receiver);
      receiver.mockClear();

      rule.addRule({ c: 'nested-3' });

      expect(onUpdate).not.toHaveBeenCalled();
      expect(receiver).not.toHaveBeenCalled();
    });

    describe('list grab', () => {
      it('grabs matching rules', () => {

        const list = rule.grab({ c: 'nested' }).grab({ c: 'nested-2' });

        expect(ruleSelectors(list)).toEqual([nested2.selector]);
      });
    });

    describe('nested grab', () => {
      it('grabs matching nested rules', () => {

        const list = rule.nested.grab({ c: 'nested' });

        expect(ruleSelectors(list)).toEqual([nested1.selector]);
      });
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
    rule = root.addRule(selector);
  });

  it('is empty', () => {
    expect(rule.empty).toBe(true);
  });

  describe('nested', () => {
    it('are empty', () => {
      expect(itsEmpty(rule.nested)).toBe(true);
    });
  });

  describe('read', () => {
    it('sends empty properties', async () => {
      expect(await receiveProperties(rule)).toEqual({});
    });
  });

  describe('rule', () => {

    let subSelector: StypSelector.Normalized;
    let subNested: StypRule;

    beforeEach(() => {
      subSelector = [{ c: ['sub-nested'] }];
      subNested = rule.addRule(subSelector);
    });

    it('returns empty selector', () => {
      expect(subNested.empty).toBe(true);
    });
    it('returns itself when selector is empty', () => {
      expect(rule.rule({})).toBe(rule);
    });
    it('has the same root', () => {
      expect(subNested.root).toBe(root);
    });
    it('has nested selector', () => {
      expect(subNested.selector).toEqual([...selector, ...subSelector]);
    });
  });
});

function receiveProperties(rule: StypRule): Promise<StypProperties> {
  return new Promise(resolve => rule.read(resolve));
}

async function receiveSelectors(list: StypRuleList): Promise<StypSelector.Normalized[]> {

  const rules: Iterable<StypRule> = await new Promise(resolve => list.read(resolve));

  return ruleSelectors(rules);
}

function ruleSelectors(rules: Iterable<StypRule>): StypSelector.Normalized[] {
  return [...rules].map(r => r.selector);
}
