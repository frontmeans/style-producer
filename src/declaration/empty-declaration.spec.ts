import { StypDeclaration } from './declaration';
import { stypRoot } from './root';
import { StypSelector } from '../selector';
import { EmptyStypDeclaration } from './empty-declaration';

describe('EmptyStypDeclaration', () => {

  let root: StypDeclaration;

  beforeEach(() => {
    root = stypRoot();
  });

  let selector: StypSelector.Normalized;
  let decl: StypDeclaration;

  beforeEach(() => {
    selector = [{ c: ['nested'] }];
    decl = root.nested(selector);
  });

  it('is empty', () => {
    expect(decl.empty).toBe(true);
  });

  describe('read', () => {
    it('sends empty properties', async () => {
      expect(await new Promise(resolve => decl.read(resolve))).toEqual({})
    });
  });

  describe('nested', () => {

    let subSelector: StypSelector.Normalized;
    let subNested: StypDeclaration;

    beforeEach(() => {
      subSelector = [{ c: ['sub-nested'] }];
      subNested = decl.nested(subSelector);
    });

    it('returns empty selector', () => {
      expect(subNested).toBeInstanceOf(EmptyStypDeclaration);
    });
    it('returns itself when selector is empty', () => {
      expect(decl.nested({})).toBe(decl);
    });
    it('has the same root', () => {
      expect(subNested.root).toBe(root);
    });
    it('has nested selector', () => {
      expect(subNested.selector).toEqual([...selector, ...subSelector]);
    });
  });
});
