import { StyleProducer } from './style-producer';
import { StypSelector, stypSelectorText } from '../selector';
import { StypProperties } from '../rule';

/**
 * CSS stylesheet render of raw CSS text. Renders the contents of `StypProperties.$$css` property.
 *
 * It should be rendered before CSS properties normally to add the rendered rule as a first one.
 *
 * It is enabled by default in `produceStyle()` function.
 */
export function stypRenderText(
    producer: StyleProducer,
    sheet: CSSStyleSheet,
    selector: StypSelector.Normalized,
    properties: StypProperties) {

  const css = properties.$$css;

  if (css) {
    sheet.insertRule(`${stypSelectorText(selector)}{${css}}`, sheet.cssRules.length);
  }

  producer.render(sheet, selector, properties);
}
