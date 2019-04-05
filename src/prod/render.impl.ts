import { StyleProducer } from './style-producer';
import { StypSelector, stypSelectorText } from '../selector';
import { StypProperties } from '../rule';
import { filterIt, itsEach, ObjectEntry, overEntries } from 'a-iterable';
import { IMPORTANT_CSS_SUFFIX } from '../internal';
import hyphenateStyleName from 'hyphenate-style-name';
import { StypRender } from './render';

/**
 * @internal
 */
export function stypRenderDescriptor(render: StypRender): StypRender.Descriptor {
  return typeof render === 'function' ? { render } : render;
}

/**
 * @internal
 */
export function compareStypRenders(first: StypRender.Descriptor, second: StypRender.Descriptor): number {

  const firstOrder = first.order || 0;
  const secondOrder = second.order || 0;

  return firstOrder > secondOrder ? 1 : firstOrder < secondOrder ? -1 : 0;
}

/**
 * @internal
 */
export function stypRenderProperties(
    producer: StyleProducer,
    sheet: CSSStyleSheet,
    selector: StypSelector.Normalized,
    properties: StypProperties): void {

  const ruleIndex = sheet.insertRule(`${stypSelectorText(selector)}{}`, sheet.cssRules.length);
  const cssRule = sheet.cssRules[ruleIndex] as CSSStyleRule;
  const { style } = cssRule;

  itsEach(
      filterIt<ObjectEntry<StypProperties>, [string, StypProperties.Value]>(
          overEntries(properties),
          notCustomProperty),
      ([key, value]) => {
        value = String(value);

        let priority: 'important' | undefined;

        if (value.endsWith('!important')) {
          priority = 'important';
          value = value.substring(0, value.length - IMPORTANT_CSS_SUFFIX.length).trim();
        }

        style.setProperty(hyphenateStyleName(key), value, priority);
      });

  producer.render(sheet, selector, properties);
}

function notCustomProperty(entry: ObjectEntry<StypProperties>): entry is [string, StypProperties.Value] {
  return String(entry[0])[0] !== '$';
}
