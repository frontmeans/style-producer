import { NameInNamespace, NamespaceDef } from './namespace';
import { NamespaceRegistrar } from './namespace-registrar';
import { compareScalars } from '../internal';

/**
 * @internal
 */
export function isSingleName(name: NameInNamespace | readonly NameInNamespace[]): name is NameInNamespace {
  return typeof name === 'string' || name[1] instanceof NamespaceDef;
}

/**
 * @internal
 */
export function namesEqual(first: NameInNamespace, second: NameInNamespace): boolean {
  if (typeof first === 'string') {
    return first === second;
  }
  if (typeof second === 'string') {
    return false;
  }
  return first[0] === second[0] && first[1] === second[1];
}

/**
 * @internal
 */
export function compareNames(first: NameInNamespace, second: NameInNamespace): number {
  if (typeof first === 'string') {
    if (typeof second === 'string') {
      return compareScalars(first, second);
    }
    return -1;
  }
  if (typeof second === 'string') {
    return 1;
  }

  return first[1].compare(second[1]) || compareScalars(first[0], second[0]);
}

/**
 * @internal
 */
export function xmlNs(ns: string | NamespaceDef, nsAlias: NamespaceRegistrar): string {
  return typeof ns === 'string' ? ns : nsAlias(ns);
}

/**
 * @internal
 */
export function qualifyId(id: NameInNamespace, nsAlias: NamespaceRegistrar): string {
  return qualifyName(id, nsAlias, 'id');
}

/**
 * @internal
 */
export function qualifyElement(id: NameInNamespace, nsAlias: NamespaceRegistrar): string {
  return qualifyName(id, nsAlias, 'html');
}

/**
 * @internal
 */
export function qualifyClass(className: NameInNamespace, nsAlias: NamespaceRegistrar): string {
  return qualifyName(className, nsAlias, 'css');
}

function qualifyName(
    name: NameInNamespace,
    nsAlias: NamespaceRegistrar,
    scope?: 'id' | 'css' | 'html'): string {
  if (typeof name === 'string') {
    return name;
  }

  const [local, ns] = name;

  return ns.qualify(nsAlias(ns), local, scope);
}
