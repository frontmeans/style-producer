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

function isCSSStyleSheet(sheet: StyleSheet): sheet is CSSStyleSheet {
  return 'cssRules' in sheet;
}

function cssRules(): AIterable<CSSRule> {
  return stylesheets()
      .flatMap(sheet => overArray(sheet.cssRules));
}

export function cssStyles(selector?: string): AIterable<CSSStyleDeclaration> {
  return cssRules()
      .filter<CSSStyleRule>(isCSSStyleRule)
      .filter(r => !selector || r.selectorText === selector)
      .map(r => r.style);
}

function isCSSStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return rule.type === CSSRule.STYLE_RULE;
}

export function mediaRules(query?: string): AIterable<CSSMediaRule> {
  return cssRules()
      .filter<CSSMediaRule>(isCSSMediaRule)
      .filter(rule => !query || rule.media.mediaText === query);
}

function isCSSMediaRule(rule: CSSRule): rule is CSSMediaRule {
  return rule.type === CSSRule.MEDIA_RULE;
}

export function removeStyleElements() {
  AIterable.from(overArray(document.head.querySelectorAll('style'))).forEach(e => e.remove());
}
