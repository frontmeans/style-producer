/**
 * Namespace specifier.
 *
 * The first element of this tuple is global namespace URI. The rest are preferred shortcuts (e.g. prefixes) to use.
 */
export type NamespaceSpec = readonly [string, ...string[]];

/**
 * A name in some namespace.
 *
 * This is either a local unqualified name, or a tuple consisting of local name and namespace specifier this name
 * belongs to.
 */
export type NameInNamespace = string | readonly [string, NamespaceSpec];
