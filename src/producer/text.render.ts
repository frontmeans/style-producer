import { StyleProducer } from './style-producer';
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
export const stypRenderText: StypRender = function renderText(producer: StyleProducer, properties: StypProperties) {

  const css = properties.$$css;

  if (!css) {
    producer.render(properties);
  } else {

    const cssRule = appendCSSRule(producer.target, producer.selector) as CSSStyleRule;

    cssRule.style.cssText = css;
    producer.render(properties, { target: cssRule });
  }
};
