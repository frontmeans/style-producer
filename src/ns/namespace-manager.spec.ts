import { NamespaceManager, newNamespaceManager } from './namespace-manager';

describe('NamespaceManager', () => {

  let nsManager: NamespaceManager;

  beforeEach(() => {
    nsManager = newNamespaceManager();
  });

  describe('nsShortcut', () => {
    it('uses preferred shortcut', () => {
      expect(nsManager.nsShortcut(['some:ns', 'ns'])).toBe('ns');
    });
    it('uses second preferred shortcut when the first one occupied', () => {
      nsManager.nsShortcut(['some:ns', 'ns']);
      expect(nsManager.nsShortcut(['other:ns', 'ns', 'other'])).toBe('other');
    });
    it('uses registered shortcut', () => {
      nsManager.nsShortcut(['some:ns', 'ns']);
      expect(nsManager.nsShortcut(['some:ns'])).toBe('ns');
    });
    it('generates unique shortcut preferred one is not provided', () => {

      const shortcut = nsManager.nsShortcut(['some:ns']);

      expect(nsManager.nsShortcut(['some:ns'])).toBe(shortcut);
    });
    it('generates unique shortcut preferred one is occupied', () => {

      const shortcut = nsManager.nsShortcut(['some:ns', 'ns']);

      expect(nsManager.nsShortcut(['other:ns', 'ns'])).toBe(shortcut + 2);
      expect(nsManager.nsShortcut(['third:ns', 'ns'])).toBe(shortcut + 3);
    });
  });

  describe('localName', () => {
    it('returns non-qualified name as is', () => {
      expect(nsManager.localName('name')).toBe('name');
    });
    it('appends suffix to CSS class names', () => {
      expect(nsManager.localName(['class-name', ['some:ns', 'ns']], 'css')).toBe('class-name@ns');
    });
    it('prefixes other names', () => {
      expect(nsManager.localName(['element-name', ['some:ns', 'ns']])).toBe('ns-element-name');
    });
  });
});
