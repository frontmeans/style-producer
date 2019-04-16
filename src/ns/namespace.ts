import { compareScalars, isNotEmptyArray } from '../internal';

let orderSeq = 0;

/**
 * Namespace definition.
 *
 * There should be exactly one instance of definition per namespace.
 */
export class NamespaceDef {

  /**
   * Preferred namespace aliases.
   */
  readonly aliases: readonly [string, ...string[]];

  /**
   * @internal
   */
  private readonly _order: number = orderSeq++;

  /**
   * Preferred namespace alias.
   */
  get alias(): string {
    return this.aliases[0];
  }

  /**
   * Constructs new namespace definition.
   *
   * @param aliases Preferred namespace aliases.
   */
  constructor(...aliases: string[]) {
    this.aliases = isNotEmptyArray(aliases) ? aliases : ['ns'];
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

  /**
   * Compares this namespace with another one based on internal sort order.
   *
   * @param other Namespace definition to compare with.
   *
   * @returns -1 if `this` is less than `other, `0` is they are the same, or `1` if `this` is greater than `other`.
   */
  compare(other: NamespaceDef): number {
    return compareScalars(this._order, other._order);
  }

}

/**
 * A name in some namespace.
 *
 * This is either a local unqualified name, or a tuple consisting of local name and namespace definition this name
 * belongs to.
 */
export type NameInNamespace = string | readonly [string, NamespaceDef];