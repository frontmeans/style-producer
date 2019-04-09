import { StypSelector, stypSelectorText } from '../selector';

/**
 * @internal
 */
export function isCSSRuleGroup(sheetOrRule: CSSStyleSheet | CSSRule): sheetOrRule is (CSSGroupingRule | CSSStyleSheet) {
  return 'cssRules' in sheetOrRule;
}

/**
 * @internal
 */
export function appendCSSRule(sheetOrRule: CSSStyleSheet | CSSRule, selector: StypSelector.Normalized): CSSRule {
  if (!isCSSRuleGroup(sheetOrRule)) {
    return sheetOrRule;
  }

  const ruleIndex = sheetOrRule.insertRule(`${stypSelectorText(selector)}{}`, sheetOrRule.cssRules.length);

  return sheetOrRule.cssRules[ruleIndex];
}
