import { NameInNamespace, NamespaceSpec } from './namespace-spec';

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
   * @param ns A specifier of namespace to return shortcut for.
   *
   * @returns Namespace shortcut string.
   */
  abstract nsShortcut(ns: NamespaceSpec): string;

  /**
   * Converts a name in namespace to local name. E.g by prefixing it with namespace shortcut.
   *
   * @param name A name to convert.
   * @param scope Name scope. Can be `html` for HTML element names, `css` for CSS class names, or absent for everything
   * else.
   *
   * @returns Local name with namespace shortcut applied, or the `name` itself for local names.
   */
  localName(name: NameInNamespace, scope?: 'html' | 'css'): string {
    if (typeof name === 'string') {
      return name;
    }

    const [local, nsSpec] = name;
    const nsShortcut = this.nsShortcut(nsSpec);

    if (scope === 'css') {
      return `${local}@${nsShortcut}`;
    }

    return `${nsShortcut}-${local}`;
  }

}

/**
 * Creates new instance of default namespace manager implementation.
 */
export function newNamespaceManager(): NamespaceManager {

  const shortcutsById = new Map<string, string>();
  const idsPerShortcut = new Map<string, number>();

  class DefaultNsManager extends NamespaceManager {

    nsShortcut([id, ...shortcuts]: NamespaceSpec): string {

      const found = shortcutsById.get(id);

      if (found) {
        return found;
      }

      let idsRegistered = 0;

      for (const preferred of shortcuts) {

        const ids = idsPerShortcut.get(preferred);

        if (!ids) {
          shortcutsById.set(id, preferred);
          idsPerShortcut.set(preferred, 1);
          return preferred;
        }
        if (!idsRegistered) {
          idsRegistered = ids;
        }
      }

      const firstPreferred = shortcuts[0] || 'ns';
      const generated = firstPreferred + (++idsRegistered);

      shortcutsById.set(id, generated);
      idsPerShortcut.set(firstPreferred, idsRegistered);

      return generated;
    }

  }

  return new DefaultNsManager();
}
