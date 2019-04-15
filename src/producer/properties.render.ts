import { StyleProducer } from './style-producer';
import { StypProperties } from '../rule';
import { filterIt, itsEach, ObjectEntry, overEntries } from 'a-iterable';
import hyphenateStyleName from 'hyphenate-style-name';
import { stypPropertyValue } from '../rule/properties.impl';

/**
 * Renders CSS properties.
 *
 * This render is always present, so there is typically no need to use it explicitly.
 */
export function stypRenderProperties(producer: StyleProducer, properties: StypProperties): void {

  const cssRule = producer.addRule() as CSSStyleRule;
  const { style } = cssRule;

  itsEach(
      filterIt<ObjectEntry<StypProperties>, ObjectEntry<StypProperties, string>>(
          overEntries(properties),
          notCustomProperty),
      ([k, v]) => {

        const [value, priority] = stypPropertyValue(v);

        if (value) {
          style.setProperty(hyphenateStyleName(k), value, priority);
        }
      });

  producer.render(properties, { target: cssRule });
}

function notCustomProperty(entry: ObjectEntry<StypProperties>): entry is ObjectEntry<StypProperties, string> {

  const firstChar = String(entry[0])[0];

  return firstChar !== '$' && firstChar !== '@';
}
