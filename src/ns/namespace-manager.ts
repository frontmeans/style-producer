import { NamespaceDef } from './namespace';

/**
 * Namespace manager.
 *
 * It is responsible for mapping of namespaces into unique shortcuts.
 */
export abstract class NamespaceManager {

  /**
   * Returns a shortcut for the given namespace.
   *
   * Tries to find a mapped shortcut for the given namespace. If not found then tries to use one of preferred shortcuts.
   * If all of them are reserved for another namespaces, then generates a new unique shortcut.
   *
   * @param ns A definition of namespace to return shortcut for.
   *
   * @returns Namespace shortcut string.
   */
  abstract nsShortcut(ns: NamespaceDef): string;

}

/**
 * Creates new instance of default namespace manager implementation.
 */
export function newNamespaceManager(): NamespaceManager {

  const shortcutsByNs = new Map<NamespaceDef, string>();
  const nsNumPerShortcut = new Map<string, number>();

  class DefaultNsManager extends NamespaceManager {

    nsShortcut(ns: NamespaceDef): string {

      const found = shortcutsByNs.get(ns);

      if (found) {
        return found;
      }

      let nsNumRegistered = 0;

      for (const preferred of ns.shortcuts) {

        const ids = nsNumPerShortcut.get(preferred);

        if (!ids) {
          shortcutsByNs.set(ns, preferred);
          nsNumPerShortcut.set(preferred, 1);
          return preferred;
        }
        if (!nsNumRegistered) {
          nsNumRegistered = ids;
        }
      }

      const firstPreferred = ns.shortcut;
      const generated = firstPreferred + (++nsNumRegistered);

      shortcutsByNs.set(ns, generated);
      nsNumPerShortcut.set(firstPreferred, nsNumRegistered);

      return generated;
    }

  }

  return new DefaultNsManager();
}
