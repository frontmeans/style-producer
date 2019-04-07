import { StyleProducer } from './style-producer';
import { StypSelector, stypSelectorText } from '../selector';
import { StypProperties } from '../rule';
import { StypRender } from './render';
import { isCSSRuleGroup } from './render.impl';

/**
 * CSS stylesheet render of raw CSS text. Renders the contents of `StypProperties.$$css` property.
 *
 * It should be rendered before CSS properties normally to add the rendered rule as a first one.
 *
 * Enabled by default in `produceStyle()` function.
 */
export const stypRenderText: StypRender = function renderText(
    producer: StyleProducer,
    sheetOrRule: CSSStyleSheet | CSSRule,
    selector: StypSelector.Normalized,
    properties: StypProperties) {

  const css = properties.$$css;

  if (css) {
    if (isCSSRuleGroup(sheetOrRule)) {
      sheetOrRule.insertRule(`${stypSelectorText(selector)}{${css}}`, sheetOrRule.cssRules.length);
    } else {
      (sheetOrRule as CSSStyleRule).style.cssText = css;
    }
  }

  producer.render(sheetOrRule, selector, properties);
};
