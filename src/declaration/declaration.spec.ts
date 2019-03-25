import { EmptyStypDeclaration, StypDeclaration } from './declaration';
import { StypSelector, stypSelector } from '../selector';
import { stypRoot } from './root';
import { keepValue } from '../internal';
import { AfterEvent, AfterEvent__symbol, trackValue, ValueTracker } from 'fun-events';
import { StypProperties } from './properties';
import Mock = jest.Mock;

describe('StypDeclaration', () => {

  let root: StypDeclaration;

  beforeEach(() => {
    root = stypRoot();
  });

  let decl: StypDeclaration;
  let mockSpec: Mock<AfterEvent<[StypProperties]>, [StypDeclaration]>;

  beforeEach(() => {
    mockSpec = jest.fn();

    class TestDeclaration extends StypDeclaration {

      readonly root = root;
      readonly spec = mockSpec;

      constructor(readonly selector: StypSelector.Normalized) {
        super();
      }

      nested(selector: StypSelector): StypDeclaration {
        return new TestDeclaration([...this.selector, ...stypSelector(selector)]);
      }

    }

    decl = new TestDeclaration([{ e: 'test-element' }]);
  });

  describe('empty', () => {
    it('is `false` by default', () => {
      expect(decl.empty).toBe(false);
    });
  });

  describe('allNested', () => {
    it('is empty by default', () => {
      expect([...decl.allNested]).toHaveLength(0);
    });
  });

  describe('read', () => {

    let properties: StypProperties;

    beforeEach(() => {
      properties = { fontSize: '12px' };
      mockSpec.mockImplementation(() => keepValue(properties));
    });

    it('reads the spec', () => {
      expect(decl.read.kept).toEqual([properties]);
      expect(mockSpec).toHaveBeenCalledWith(decl);
    });
    it('caches the spec', () => {
      expect(decl.read).toBe(decl.read);
      expect(mockSpec).toHaveBeenCalledTimes(1);
    });
  });

  describe('[AfterEvent__symbol]', () => {
    it('is the same as `read`', () => {
      expect(decl[AfterEvent__symbol]).toBe(decl.read);
    });
  });

  describe('add', () => {

    beforeEach(() => {
      decl = root.nested([ { e: 'element-1' }, '>', { e: 'element-1-1' }]);

    });

    let update: ValueTracker<StypProperties>;
    let updated: StypDeclaration;

    beforeEach(() => {
      update = trackValue({ display: 'block' });
      updated = decl.add(update.read);
    });

    let decl2: StypDeclaration;

    beforeEach(() => {
      decl2 = updated.root.nested([ { e: 'element-2' }]);
    });

    it('recreates hierarchy', () => {
      expect(updated).not.toBe(decl);
      expect(updated.selector).toEqual(decl.selector);
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
    it('adds another declaration', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = decl2.add(update2);

      expect(await receiveProperties(updated2)).toEqual(update2);
      expect(await receiveProperties(updated2.root.nested(updated.selector))).toEqual(update.it);
    });
    it('adds nested declaration', async () => {

      const update2: StypProperties = { width: '100%' };
      const updated2 = updated.nested({ e: 'element-1-2' }).add(update2);

      expect(await receiveProperties(updated2)).toEqual(update2);
      expect(await receiveProperties(updated2.root.nested(updated.selector))).toEqual(update.it);
    });
  });
});

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
      expect(await new Promise(resolve => decl.read(resolve))).toEqual({});
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

function receiveProperties(decl: StypDeclaration): Promise<StypProperties> {
  return new Promise(resolve => decl.read(resolve));
}
