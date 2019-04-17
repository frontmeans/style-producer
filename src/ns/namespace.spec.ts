import { NamespaceDef } from './namespace';

describe('NamespaceDef', () => {
  describe('localName', () => {

    let ns: NamespaceDef;

    beforeEach(() => {
      ns = new NamespaceDef('test/url');
    });

    it('appends suffix to CSS class names', () => {
      expect(ns.qualify('ns', 'class-name', 'css')).toBe('class-name@ns');
    });
    it('prefixes other names', () => {
      expect(ns.qualify('ns', 'element-name')).toBe('ns-element-name');
    });
  });

  describe('alias', () => {
    it('is `ns` by default', () => {
      expect(new NamespaceDef('test/url').alias).toBe('ns');
    });
  });
});
