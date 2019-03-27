import { EmptyStypRule, StypRule } from './rule';
import { StypSelector, stypSelector } from '../selector';
import { stypRoot } from './root';
import { keepValue } from '../internal';
import { AfterEvent, AfterEvent__symbol, trackValue, ValueTracker } from 'fun-events';
import { StypProperties } from './properties';
import Mock = jest.Mock;

describe('StypRule', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let rule: StypRule;
  let mockSpec: Mock<AfterEvent<[StypProperties]>, [StypRule]>;

  beforeEach(() => {
    mockSpec = jest.fn();

    class TestRule extends StypRule {

      readonly root = root;
      readonly spec = mockSpec;

      constructor(readonly selector: StypSelector.Normalized) {
        super();
      }

      rule(selector: StypSelector): StypRule {
        return new TestRule([...this.selector, ...stypSelector(selector)]);
      }

    }

    rule = new TestRule([{ e: 'test-element' }]);
  });

  describe('empty', () => {
    it('is `false` by default', () => {
      expect(rule.empty).toBe(false);
    });
  });

  describe('allNested', () => {
    it('is empty by default', () => {
      expect([...rule.rules]).toHaveLength(0);
    });
  });

  describe('read', () => {

    let properties: StypProperties;

    beforeEach(() => {
      properties = { fontSize: '12px' };
      mockSpec.mockImplementation(() => keepValue(properties));
    });

    it('reads the spec', () => {
      expect(rule.read.kept).toEqual([properties]);
      expect(mockSpec).toHaveBeenCalledWith(rule);
    });
    it('caches the spec', () => {
      expect(rule.read).toBe(rule.read);
      expect(mockSpec).toHaveBeenCalledTimes(1);
    });
  });

  describe('[AfterEvent__symbol]', () => {
    it('is the same as `read`', () => {
      expect(rule[AfterEvent__symbol]).toBe(rule.read);
    });
  });

  describe('add', () => {

    beforeEach(() => {
      rule = root.rule([ { e: 'element-1' }, '>', { e: 'element-1-1' }]);
    });

    let update: ValueTracker<StypProperties>;
    let updated: StypRule;

    beforeEach(() => {
      update = trackValue({ display: 'block' });
      updated = rule.add(update.read);
    });

    let rule2: StypRule;

    beforeEach(() => {
      rule2 = updated.root.rule([ { e: 'element-1', $: 'biz' }]);
    });

    it('recreates hierarchy', () => {
      expect(updated).not.toBe(rule);
      expect(updated.selector).toEqual(rule.selector);
      expect(updated.root).not.toBe(root);
    });
    it('applies update', async () => {
      expect(updated.empty).toBe(false);
      expect(await receiveProperties(updated)).toEqual(update.it);
    });
    it('merges updated properties', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = updated.add(update2);

      expect(await receiveProperties(updated2)).toEqual({ ...update.it, ...update2 });
    });
    it('adds another rule', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = rule2.add(update2);

      expect(await receiveProperties(updated2)).toEqual(update2);
      expect(await receiveProperties(updated2.root.rule(updated.selector))).toEqual(update.it);
    });
    it('adds nested rule', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = updated.rule({ e: 'element-1-2' }).add(update2);

      expect(await receiveProperties(updated2)).toEqual(update2);
      expect(await receiveProperties(updated2.root.rule(updated.selector))).toEqual(update.it);
    });
  });
});

describe('EmptyStypRule', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let selector: StypSelector.Normalized;
  let rule: StypRule;

  beforeEach(() => {
    selector = [{ c: ['nested'] }];
    rule = root.rule(selector);
  });

  it('is empty', () => {
    expect(rule.empty).toBe(true);
  });

  describe('read', () => {
    it('sends empty properties', async () => {
      expect(await receiveProperties(rule)).toEqual({});
    });
  });

  describe('nested', () => {

    let subSelector: StypSelector.Normalized;
    let subNested: StypRule;

    beforeEach(() => {
      subSelector = [{ c: ['sub-nested'] }];
      subNested = rule.rule(subSelector);
    });

    it('returns empty selector', () => {
      expect(subNested).toBeInstanceOf(EmptyStypRule);
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
