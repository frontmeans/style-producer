import { stypRoot } from './root';
import { AfterEvent__symbol, OnEvent__symbol, onNever, trackValue } from 'fun-events';
import { StypDeclaration } from './declaration';
import { StypSelector } from './selector';

describe('stypRoot', () => {
  it('is cached when properties omitted', () => {
    expect(stypRoot()).toBe(stypRoot());
  });
  it('is not cached when properties specified', () => {

    const props = { fontSize: '12px' };

    expect(stypRoot(props)).not.toBe(stypRoot(props));
  });

  describe('[OnEvent__symbol]', () => {
    it('is the same as `onUpdate`', () => {

      const decl = stypRoot();

      expect(decl[OnEvent__symbol]).toBe(decl.onUpdate);
    });
  });

  describe('[AfterEvent__symbol]', () => {
    it('is the same as `read`', () => {

      const decl = stypRoot();

      expect(decl[AfterEvent__symbol]).toBe(decl.read);
    });
  });

  describe('root', () => {
    it('points to itself', () => {

      const decl = stypRoot();

      expect(decl.root).toBe(decl);
    });
  });

  describe('read', () => {
    it('sends initial properties', async () => {

      const initial = { fontSize: '12px' };
      const decl = stypRoot(initial);

      expect(await new Promise(resolve => decl.read(resolve))).toEqual(initial);
    });
    it('sends tracked values', async () => {

      const initial = { fontSize: '12px' };
      const tracker = trackValue(initial);
      const decl = stypRoot(tracker);

      expect(await new Promise(resolve => decl.read(resolve))).toEqual(initial);

      const updated = { fontSize: '13px' };

      tracker.it = updated;

      expect(await new Promise(resolve => decl.read(resolve))).toEqual(updated);
    });
  });

  describe('onUpdate', () => {
    it('sends updates', async () => {

      const initial = { fontSize: '12px' };
      const tracker = trackValue(initial);
      const decl = stypRoot(tracker);
      const promise = new Promise(resolve => decl.onUpdate((n, o) => resolve([n, o])))
      const updated = { fontSize: '13px' };

      tracker.it = updated;

      expect(await promise).toEqual([updated, initial]);
    });
  });

  describe('selector', () => {
    it('is empty', () => {
      expect(stypRoot().selector).toHaveLength(0);
    });
  });

  describe('select', () => {

    let root: StypDeclaration;

    beforeEach(() => {
      root = stypRoot();
    });

    let selector: StypSelector.Normalized;
    let nested: StypDeclaration;

    beforeEach(() => {
      selector = [{ c: ['nested'] }];
      nested = root.select(selector);
    });

    it('returns itself when selector is empty', () => {
      expect(root.select([])).toBe(root);
    });
    it('returns nested declaration', () => {
      expect(nested.root).toBe(root);
      expect(nested.selector).toEqual(selector);
    });
    it('returns empty declaration', async () => {
      expect(await new Promise(resolve => nested.read(resolve))).toEqual({});
    });

    describe('empty declaration', () => {
      it('is never updated', () => {
        expect(nested.onUpdate).toBe(onNever);
      });
    });

    describe('select', () => {

      let subSelector: StypSelector.Normalized;
      let subNested: StypDeclaration;

      beforeEach(() => {
        subSelector = [{ c: ['sub-nested'] }];
        subNested = nested.select(subSelector);
      });

      it('returns empty selector', () => {
        expect(subNested.constructor).toBe(nested.constructor);
      });
      it('returns itself when selector is empty', () => {
        expect(nested.select({})).toBe(nested);
      });
      it('has the same root', () => {
        expect(subNested.root).toBe(root);
      });
      it('has nested selector', () => {
        expect(subNested.selector).toEqual([...selector, ...subSelector]);
      });
    });
  });
});
