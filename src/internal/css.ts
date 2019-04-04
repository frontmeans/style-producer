import cssesc from 'cssesc';

/**
 * @internal
 */
export function cssescId(id: string): string {
  return cssesc(id, { isIdentifier: true });
}

export const IMPORTANT_CSS_SUFFIX = '!important';
