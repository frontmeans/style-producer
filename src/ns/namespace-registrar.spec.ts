import { NamespaceRegistrar, newNamespaceRegistrar } from './namespace-registrar';
import { NamespaceDef } from './namespace';

describe('NamespaceRegistrar', () => {

  let nsRegistrar: NamespaceRegistrar;

  beforeEach(() => {
    nsRegistrar = newNamespaceRegistrar();
  });

  describe('nsShortcut', () => {
    it('uses preferred shortcut', () => {
      expect(nsRegistrar(new NamespaceDef('test'))).toBe('test');
    });
    it('uses second preferred shortcut when the first one occupied', () => {
      nsRegistrar(new NamespaceDef('test'));
      expect(nsRegistrar(new NamespaceDef('test', 'other'))).toBe('other');
    });
    it('uses registered shortcut', () => {

      const ns = new NamespaceDef('test');

      nsRegistrar(ns);
      expect(nsRegistrar(ns)).toBe('test');
    });
    it('generates unique shortcut if preferred one is absent', () => {

      const ns = new NamespaceDef('test');
      const shortcut = nsRegistrar(ns);

      expect(nsRegistrar(ns)).toBe(shortcut);
    });
    it('generates unique shortcut preferred one is occupied', () => {

      const ns = new NamespaceDef('test');
      const shortcut = nsRegistrar(ns);

      expect(nsRegistrar(new NamespaceDef('test'))).toBe(shortcut + 2);
      expect(nsRegistrar(new NamespaceDef('test'))).toBe(shortcut + 3);
    });
  });
});
