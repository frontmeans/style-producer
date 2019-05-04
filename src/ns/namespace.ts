import { isNotEmptyArray } from '../internal';

/**
 * Namespace definition.
 *
 * Namespaces are identified by their URLs.
 */
export class NamespaceDef {

  /**
   * Unique namespace URL.
   */
  readonly url: string;

  /**
   * Preferred namespace aliases.
   */
  readonly aliases: readonly string[];

  /**
   * The most preferred namespace alias.
   *
   * By default this is the first preferred alias, or `ns` if there is no preferred aliases.
   */
  get alias(): string {
    return this.aliases[0] || 'ns';
  }

  /**
   * Constructs new namespace definition.
   *
   * @param url Unique namespace URL.
   * @param aliases Preferred namespace aliases.
   */
  constructor(url: string, ...aliases: string[]) {
    this.url = url;
    this.aliases = aliases;
  }

  /**
   * Qualifies a local name in this namespace. E.g by prefixing it with namespace alias.
   *
   * @param alias Namespace alias to apply to the name.
   * @param name A name to convert.
   * @param scope Name scope. Can be `id` for element identifiers, `html` for HTML element names, `css` for CSS class
   * names, or absent for everything else.
   *
   * @returns A name qualified with namespace alias.
   */
  qualify(alias: string, name: string, scope?: 'id' | 'css' | 'html'): string {
    return scope === 'css' ? `${name}@${alias}` : `${alias}-${name}`;
  }

}

/**
 * A name in some namespace.
 *
 * This is either a local unqualified name, or a tuple consisting of local name and namespace definition this name
 * belongs to.
 */
export type NameInNamespace = string | readonly [string, NamespaceDef];
