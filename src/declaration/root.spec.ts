import { stypRoot } from './root';
import { AfterEvent__symbol } from 'fun-events';
import { StypSelector } from '../selector';
import { StypDeclaration } from './declaration';
import { EmptyStypDeclaration } from './empty-declaration';

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

      const decl = stypRoot();

      expect(decl.root).toBe(decl);
    });
  });

  describe('read', () => {
    it('sends properties', async () => {

      const initial = { fontSize: '12px' };
      const decl = stypRoot(initial);

      expect(await new Promise(resolve => decl.read(resolve))).toEqual(initial);
    });
  });

  describe('selector', () => {
    it('is empty', () => {
      expect(stypRoot().selector).toHaveLength(0);
    });
  });

  describe('nested', () => {

    let root: StypDeclaration;

    beforeEach(() => {
      root = stypRoot();
    });

    let selector: StypSelector.Normalized;
    let nested: StypDeclaration;

    beforeEach(() => {
      selector = [{ c: ['nested'] }];
      nested = root.nested(selector);
    });

    it('returns itself when selector is empty', () => {
      expect(root.nested([])).toBe(root);
    });
    it('returns nested declaration', () => {
      expect(nested.root).toBe(root);
      expect(nested.selector).toEqual(selector);
    });
    it('returns empty declaration', () => {
      expect(nested).toBeInstanceOf(EmptyStypDeclaration);
    });
  });
});
