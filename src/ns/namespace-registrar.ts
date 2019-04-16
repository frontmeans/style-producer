import { NamespaceDef } from './namespace';

/**
 * Namespace registrar function interface.
 *
 * Namespace registrar function maps namespaces to their unique aliases.
 *
 * @param ns A definition of namespace to find alias for.
 *
 * @returns Namespace alias.
 */
export type NamespaceRegistrar = (ns: NamespaceDef) => string;

/**
 * Creates a namespace registrar.
 *
 * The returned registrar tries to find a registered alias for the given namespace. If not found then tries to use one
 * of its preferred aliases. If all of them are reserved already for another namespaces, generates a new unique alias.
 *
 * @returns New instance of namespace registrar.
 */
export function newNamespaceRegistrar(): NamespaceRegistrar {

  const aliasesByNs = new Map<NamespaceDef, string>();
  const nsNumPerAlias = new Map<string, number>();

  return function nsAlias(ns: NamespaceDef): string {

    const found = aliasesByNs.get(ns);

    if (found) {
      return found;
    }

    let nsNumRegistered = 0;

    for (const preferred of ns.aliases) {

      const ids = nsNumPerAlias.get(preferred);

      if (!ids) {
        aliasesByNs.set(ns, preferred);
        nsNumPerAlias.set(preferred, 1);
        return preferred;
      }
      if (!nsNumRegistered) {
        nsNumRegistered = ids;
      }
    }

    const firstPreferred = ns.alias;
    const generated = firstPreferred + (++nsNumRegistered);

    aliasesByNs.set(ns, generated);
    nsNumPerAlias.set(firstPreferred, nsNumRegistered);

    return generated;
  };
}
