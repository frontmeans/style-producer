import { stypRoot } from './root';
import { StypSelector } from '../selector';
import { EmptyStypRule, StypRule } from './rule';
import { StypProperties } from './properties';

describe('stypRoot', () => {
  it('is empty without properties', () => {
    expect(stypRoot().empty).toBe(true);
  });
  it('is not empty with properties', () => {
    expect(stypRoot({ fontSize: '12px' }).empty).toBe(false);
  });
  it('is cached without properties', () => {
    expect(stypRoot()).toBe(stypRoot());
  });
  it('is not cached with properties', () => {

    const props = { fontSize: '12px' };

    expect(stypRoot(props)).not.toBe(stypRoot(props));
  });

  describe('root', () => {
    it('points to itself', () => {

      const root = stypRoot();

      expect(root.root).toBe(root);
    });
  });

  describe('read', () => {
    it('sends properties', async () => {

      const initial = { fontSize: '12px' };
      const root = stypRoot(initial);

      expect(await receiveProperties(root)).toEqual(initial);
    });
  });

  describe('selector', () => {
    it('is empty', () => {
      expect(stypRoot().selector).toHaveLength(0);
    });
  });

  describe('add', () => {

    let extension = { fontSize: '13px' };
    let extended: StypRule;

    beforeEach(() => {
      extension = { fontSize: '13px' };
      extended = stypRoot().add(extension);
    });

    it('creates new root', () => {
      expect(extended).not.toBe(stypRoot());
      expect(extended.root).toBe(extended);
      expect(extended.selector).toHaveLength(0);
    });
    it('extends rule', async () => {
      expect(await receiveProperties(extended)).toEqual(extension);
    });
    it('does not add nested rules', () => {
      expect([...extended.rules]).toHaveLength(0);
      expect(extended.rule('some').empty).toBe(true);
    });
  });

  describe('rules', () => {

    let root: StypRule;

    beforeEach(() => {
      root = stypRoot();
    });

    let selector: StypSelector.Normalized;
    let nested: StypRule;

    beforeEach(() => {
      selector = [{ c: ['nested'] }];
      nested = root.rule(selector);
    });

    it('returns itself when selector is empty', () => {
      expect(root.rule([])).toBe(root);
    });
    it('returns nested rule', () => {
      expect(nested.root).toBe(root);
      expect(nested.selector).toEqual(selector);
    });
    it('returns empty rule', () => {
      expect(nested).toBeInstanceOf(EmptyStypRule);
    });
  });
});

function receiveProperties(rule: StypRule): Promise<StypProperties> {
  return new Promise(resolve => rule.read(resolve));
}
