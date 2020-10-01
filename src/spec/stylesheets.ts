import { filterIt, flatMapIt, itsEach, itsFirst, mapIt, overArray } from '@proc7ts/push-iterator';

export function cssStyle(selector?: string): CSSStyleDeclaration {

  const style = itsFirst(cssStyles(selector));

  if (!style) {
    return fail(`Rule not found: ${selector}`);
  }

  return style;
}

export function stylesheets(): Iterable<CSSStyleSheet> {
  return filterIt(
      overArray(document.styleSheets),
      isCSSStyleSheet,
  );
}

function isCSSStyleSheet(sheet: StyleSheet): sheet is CSSStyleSheet {
  return 'cssRules' in sheet;
}

export function cssRules(): Iterable<CSSRule> {
  return flatMapIt(
      stylesheets(),
      sheet => overArray(sheet.cssRules),
  );
}

export function cssStyles(selector?: string): Iterable<CSSStyleDeclaration> {
  return mapIt(
      filterIt(
          filterIt<CSSRule, CSSStyleRule>(
              cssRules(),
              isCSSStyleRule,
          ),
          r => !selector || r.selectorText === selector,
      ),
      r => r.style,
  );
}

function isCSSStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return rule.type === CSSRule.STYLE_RULE;
}

export function mediaRules(query?: string): Iterable<CSSMediaRule> {
  return filterIt(
      filterIt<CSSRule, CSSMediaRule>(
          cssRules(),
          isCSSMediaRule,
      ),
      rule => !query || rule.media.mediaText === query,
  );
}

function isCSSMediaRule(rule: CSSRule): rule is CSSMediaRule {
  return rule.type === CSSRule.MEDIA_RULE;
}

export function removeStyleElements(): void {
  itsEach(
      overArray(document.head.querySelectorAll('style')),
      e => e.remove(),
  );
}
