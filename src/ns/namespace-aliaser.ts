import { NamespaceDef } from './namespace';

/**
 * Namespace aliaser function interface.
 *
 * Namespace aliaser function maps namespaces to their unique aliases.
 *
 * @param ns A definition of namespace to find alias for.
 *
 * @returns Namespace alias.
 */
export type NamespaceAliaser = (ns: NamespaceDef) => string;

/**
 * Creates a namespace aliaser.
 *
 * The returned function tries to find a registered alias for the given namespace. If not found then tries to use one
 * of its preferred aliases. If all of them are reserved already for another namespaces, generates a new unique alias.
 *
 * @returns New instance of namespace aliaser.
 */
export function newNamespaceAliaser(): NamespaceAliaser {

  const aliasesByNs = new Map<string, string>();
  const nsNumPerAlias = new Map<string, number>();

  return function nsAlias(ns: NamespaceDef): string {

    const found = aliasesByNs.get(ns.url);

    if (found) {
      return found;
    }

    let nsNumRegistered = 0;

    for (const preferred of ns.aliases) {

      const ids = nsNumPerAlias.get(preferred);

      if (!ids) {
        aliasesByNs.set(ns.url, preferred);
        nsNumPerAlias.set(preferred, 1);
        return preferred;
      }
      if (!nsNumRegistered) {
        nsNumRegistered = ids;
      }
    }

    const firstPreferred = ns.alias;
    const generated = firstPreferred + (++nsNumRegistered);

    aliasesByNs.set(ns.url, generated);
    nsNumPerAlias.set(firstPreferred, nsNumRegistered);

    return generated;
  };
}
