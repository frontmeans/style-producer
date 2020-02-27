/**
 * @internal
 */
export const FIRST_RENDER_ORDER = -0xffff;

/**
 * @internal
 */
export function isCSSRuleGroup(sheetOrRule: CSSStyleSheet | CSSRule): sheetOrRule is (CSSGroupingRule | CSSStyleSheet) {
  return 'cssRules' in sheetOrRule;
}
