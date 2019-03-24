import { StypDeclaration } from './declaration';
import { StypSelector, stypSelector } from '../selector';
import { stypRoot } from './root';
import { keepValue } from '../internal';
import { AfterEvent, AfterEvent__symbol } from 'fun-events';
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
});
