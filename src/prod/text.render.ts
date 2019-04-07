import { StyleProducer } from './style-producer';
import { StypSelector } from '../selector';
import { StypProperties } from '../rule';
import { StypRender } from './render';
import { appendCSSRule } from './render.impl';

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

    const cssRule = appendCSSRule(sheetOrRule, selector) as CSSStyleRule;

    cssRule.style.cssText = css;
    sheetOrRule = cssRule;
  }

  producer.render(sheetOrRule, selector, properties);
};
