/**
 * @internal
 */
export function isCSSRuleGroup(sheetOrRule: CSSStyleSheet | CSSRule): sheetOrRule is (CSSGroupingRule | CSSStyleSheet) {
  return 'cssRules' in sheetOrRule;
}
