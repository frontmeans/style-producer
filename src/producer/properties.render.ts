import { filterIt, itsEach, ObjectEntry, overEntries } from 'a-iterable';
import hyphenateStyleName from 'hyphenate-style-name';
import { StypProperties } from '../rule';
import { stypSplitPriority } from '../value';
import { StyleProducer } from './style-producer';

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

        const [value, priority] = stypSplitPriority(v);

        style.setProperty(hyphenateStyleName(k), `${value}`, priority);
      });

  producer.render(properties, { target: cssRule });
}

function notCustomProperty(entry: ObjectEntry<StypProperties>): entry is ObjectEntry<Required<StypProperties>, string> {

  const [key, value] = entry;

  if (value == null) {
    return false;
  }

  const first = String(key)[0];

  return first >= 'a' && first <= 'z' || first >= 'A' && first <= 'Z';
}
