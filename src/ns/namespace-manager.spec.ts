import { NamespaceManager, newNamespaceManager } from './namespace-manager';
import { NamespaceDef } from './namespace';

describe('NamespaceManager', () => {

  let nsManager: NamespaceManager;

  beforeEach(() => {
    nsManager = newNamespaceManager();
  });

  describe('nsShortcut', () => {
    it('uses preferred shortcut', () => {
      expect(nsManager.nsShortcut(new NamespaceDef('test'))).toBe('test');
    });
    it('uses second preferred shortcut when the first one occupied', () => {
      nsManager.nsShortcut(new NamespaceDef('test'));
      expect(nsManager.nsShortcut(new NamespaceDef('test', 'other'))).toBe('other');
    });
    it('uses registered shortcut', () => {

      const ns = new NamespaceDef('test');

      nsManager.nsShortcut(ns);
      expect(nsManager.nsShortcut(ns)).toBe('test');
    });
    it('generates unique shortcut if preferred one is absent', () => {

      const ns = new NamespaceDef('test');
      const shortcut = nsManager.nsShortcut(ns);

      expect(nsManager.nsShortcut(ns)).toBe(shortcut);
    });
    it('generates unique shortcut preferred one is occupied', () => {

      const ns = new NamespaceDef('test');
      const shortcut = nsManager.nsShortcut(ns);

      expect(nsManager.nsShortcut(new NamespaceDef('test'))).toBe(shortcut + 2);
      expect(nsManager.nsShortcut(new NamespaceDef('test'))).toBe(shortcut + 3);
    });
  });
});
