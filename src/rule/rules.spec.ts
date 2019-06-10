import { itsEmpty } from 'a-iterable';
import { noop } from 'call-thru';
import { onEventFrom } from 'fun-events';
import { stypRoot } from './root';
import { StypRule } from './rule';
import { lazyStypRules, StypRules, stypRules } from './rules';

describe('stypRules', () => {

  let root: StypRule;
  let rule: StypRule;

  beforeEach(() => {
    root = stypRoot({ $name: 'root' });
    rule = root.rules.add({ c: 'custom' }, { $name: 'custom' });
  });

  it('constructs empty rule set without arguments', () => {

    const rules = stypRules();

    expect(itsEmpty(rules)).toBe(true);
    expect(onEventFrom(rules)(noop).done).toBe(true);
  });
  it('returns self rule list for single rule', () => {
    expect(stypRules(root)).toBe(root.rules.self);
  });
  it('returns rule list as is', () => {
    expect(stypRules(root.rules.nested)).toBe(root.rules.nested);
  });

  describe('with source function', () => {
    it('returns call result rules', () => {
      expect([...stypRules(() => root)]).toEqual([...root.rules.self]);
    });
    it('sends rule addition', () => {

      const rules = stypRules(() => root.rules);
      const receiver = jest.fn();

      onEventFrom(rules)(receiver);

      const added = root.rules.add({ c: 'added' });

      expect(receiver).toHaveBeenCalledWith([added], []);
      expect([...rules]).toHaveLength(3);
    });
    it('sends rule removal', () => {

      const rules = stypRules(() => root.rules);
      const receiver = jest.fn();

      onEventFrom(rules)(receiver);
      rule.remove();

      expect(receiver).toHaveBeenCalledWith([], [rule]);
      expect([...rules]).toHaveLength(1);
    });
  });

  describe('with source promise', () => {
    it('returns initially empty rule set', () => {
      expect(itsEmpty(stypRules(Promise.resolve(root)))).toBe(true);
    });
    it('sends existing rules as an addition', async () => {

      const rules = stypRules(() => Promise.resolve(root));
      const receiver = jest.fn();

      await new Promise(resolve => {
        receiver.mockImplementation(resolve);
        onEventFrom(rules)(receiver);
      });

      expect(receiver).toHaveBeenCalledWith([...root.rules], []);
      expect([...rules]).toEqual([...root.rules]);
    });
    it('sends rule addition', async () => {

      const rules = stypRules(Promise.resolve(root.rules));
      const receiver = jest.fn();
      const promise = new Promise(resolve => {
        receiver.mockImplementation(resolve);
      });

      onEventFrom(rules)(receiver);
      receiver.mockClear();
      await promise;

      const added = root.rules.add({ c: 'added' });

      expect(receiver).toHaveBeenCalledWith([added], []);
      expect([...rules]).toHaveLength(3);
    });
    it('sends rule removal', async () => {

      const rules = stypRules(Promise.resolve(root.rules));
      const receiver = jest.fn();
      const promise = new Promise(resolve => {
        receiver.mockImplementation(resolve);
      });

      onEventFrom(rules)(receiver);
      receiver.mockClear();
      await promise;

      rule.remove();
      expect(receiver).toHaveBeenCalledWith([], [rule]);
      expect([...rules]).toHaveLength(1);
    });
    it('does not send anything when interest is lost', async () => {

      let resolution: (rules: StypRules) => void = noop;
      const rules = stypRules(new Promise(resolve => resolution = resolve));
      const receiver = jest.fn();

      onEventFrom(rules)(receiver).off();
      rule.remove();
      resolution(root.rules);
      await Promise.resolve();

      expect(receiver).not.toHaveBeenCalled();
    });
    it('becomes empty when all interests are lost', async () => {

      const rules = stypRules(Promise.resolve(root));
      const receiver1 = jest.fn();
      const receiver2 = jest.fn();

      const promise = new Promise(resolve => {
        receiver1.mockImplementation(resolve);
      });

      const interest1 = onEventFrom(rules)(receiver1);
      const interest2 = onEventFrom(rules)(receiver2);

      await promise;

      interest1.off();
      expect([...rules]).toEqual([...root.rules]);

      interest2.off();
      expect(itsEmpty(rules)).toBe(true);
    });
  });

  describe('with multiple sources', () => {

    let root2: StypRule;
    let rule2: StypRule;

    beforeEach(() => {
      root2 = stypRoot({ $name: 'root2' });
      rule2 = root2.rules.add({ c: 'custom2' }, { $name: 'rule2' });
    });

    it('returns all rules', () => {

      const rules = new Set(stypRules(root, root2.rules));

      expect(rules).toContain(root);
      expect(rules).not.toContain(rule);
      expect(rules).toContain(root2);
      expect(rules).toContain(rule2);
      expect(rules.size).toBe(3);
    });
    it('sends rule addition', () => {

      const rules = stypRules(root, root2.rules);
      const receiver = jest.fn();

      onEventFrom(rules)(receiver);

      const added = root2.rules.add({ c: 'added' });

      expect(receiver).toHaveBeenCalledWith([added], []);
      expect([...rules]).toHaveLength(4);
    });
    it('sends rule removal', () => {

      const rules = stypRules(root, root2.rules);
      const receiver = jest.fn();

      onEventFrom(rules)(receiver);
      rule2.remove();

      expect(receiver).toHaveBeenCalledWith([], [rule2]);
      expect([...rules]).toHaveLength(2);
    });
    it('does not send updates when interest is lost', () => {

      const rules = stypRules(root, root2.rules);
      const receiver = jest.fn();

      onEventFrom(rules)(receiver).off();
      rule2.remove();

      expect(receiver).not.toHaveBeenCalled();
      expect([...rules]).toHaveLength(2);
    });
  });
});

describe('lazyStypRules', () => {

  let root: StypRule;
  let rule: StypRule;

  beforeEach(() => {
    root = stypRoot();
    rule = root.rules.add({ c: 'custom' }, { $name: 'custom' });
  });

  it('constructs empty rule set without arguments', () => {

    const rules = lazyStypRules();

    expect(itsEmpty(rules)).toBe(true);
    expect(onEventFrom(rules)(noop).done).toBe(true);
  });
  it('returns self rule list for single rule', () => {
    expect(lazyStypRules(root)).toBe(root.rules.self);
  });
  it('returns rule list as is', () => {
    expect(lazyStypRules(root.rules.nested)).toBe(root.rules.nested);
  });

  describe('with source function', () => {
    it('returns initially empty rule set', () => {
      expect(itsEmpty(lazyStypRules(() => root))).toBe(true);
    });
    it('sends existing rules as an addition', () => {

      const rules = lazyStypRules(() => root.rules);
      const receiver = jest.fn();

      onEventFrom(rules)(receiver);
      expect(receiver).toHaveBeenCalledWith([...root.rules], []);
      expect([...rules]).toEqual([...root.rules]);
    });
    it('does not send empty existing rules', () => {

      const rules = lazyStypRules(() => rule.rules.nested);
      const receiver = jest.fn();

      onEventFrom(rules)(receiver);
      expect(receiver).not.toHaveBeenCalled();
      expect(itsEmpty(rules)).toBe(true);
    });
    it('sends rule addition', () => {

      const rules = lazyStypRules(() => root.rules);
      const receiver = jest.fn();

      onEventFrom(rules)(receiver);

      const added = root.rules.add({ c: 'added' });

      expect(receiver).toHaveBeenCalledWith([added], []);
      expect([...rules]).toHaveLength(3);
    });
    it('sends rule removal', () => {

      const rules = lazyStypRules(() => root.rules);
      const receiver = jest.fn();

      onEventFrom(rules)(receiver);
      rule.remove();

      expect(receiver).toHaveBeenCalledWith([], [rule]);
      expect([...rules]).toHaveLength(1);
    });
    it('becomes empty when all interests are lost', () => {

      const rules = lazyStypRules(() => root.rules);
      const receiver1 = jest.fn();
      const receiver2 = jest.fn();

      const interest1 = onEventFrom(rules)(receiver1);
      const interest2 = onEventFrom(rules)(receiver2);

      interest1.off();
      expect([...rules]).toHaveLength(2);

      interest2.off();
      expect(itsEmpty(rules)).toBe(true);
    });
  });
});
