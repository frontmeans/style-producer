import { AIterable, itsFirst, overArray } from 'a-iterable';

export function cssStyle(selector?: string): CSSStyleDeclaration {

  const style = itsFirst(cssStyles(selector));

  if (!style) {
    return fail(`Rule not found: ${selector}`);
  }

  return style;
}

function stylesheets(): AIterable<CSSStyleSheet> {
  return AIterable.from(overArray(document.styleSheets))
      .filter<CSSStyleSheet>(isCSSStyleSheet);
}

export function cssStyles(selector?: string): AIterable<CSSStyleDeclaration> {
  return stylesheets()
      .flatMap(sheet => overArray(sheet.cssRules))
      .filter<CSSStyleRule>(isCSSStyleRule)
      .filter(r => !selector || r.selectorText === selector)
      .map(r => r.style);
}

function isCSSStyleSheet(sheet: StyleSheet): sheet is CSSStyleSheet {
  return 'cssRules' in sheet;
}

function isCSSStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return rule.type === CSSRule.STYLE_RULE;
}
