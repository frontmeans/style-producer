import { NamespaceDef } from './namespace';

/**
 * Namespace registrar function interface.
 *
 * Namespace registrar function maps namespaces to unique shortcuts.
 *
 * @param ns A definition of namespace to find shortcut for.
 *
 * @returns Namespace shortcut string.
 */
export type NamespaceRegistrar = (ns: NamespaceDef) => string;

/**
 * Creates a namespace registrar.
 *
 * The returned registrar tries to find a mapped shortcut for the given namespace. If not found then tries to use one of
 * its preferred shortcuts. If all of them are reserved already for another namespaces, generates a new unique shortcut.
 *
 * @returns New instance of namespace registrar.
 */
export function newNamespaceRegistrar(): NamespaceRegistrar {

  const shortcutsByNs = new Map<NamespaceDef, string>();
  const nsNumPerShortcut = new Map<string, number>();

  return function nsShortcut(ns: NamespaceDef): string {

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
  };
}
