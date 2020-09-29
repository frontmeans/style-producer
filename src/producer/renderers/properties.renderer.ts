/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { filterIt, itsEach, ObjectEntry, overEntries } from '@proc7ts/push-iterator';
import hyphenateStyleName from 'hyphenate-style-name';
import { StypProperties } from '../../rule';
import { stypSplitPriority } from '../../value';
import { StyleProducer } from '../style-producer';

/**
 * Renders CSS properties.
 *
 * This renderer is always present, so there is typically no need to use it explicitly.
 *
 * @category Rendering
 */
export function stypRenderProperties(producer: StyleProducer, properties: StypProperties): void {

  const style = producer.addStyle();

  itsEach(
      filterIt<ObjectEntry<StypProperties>, ObjectEntry<StypProperties, string>>(
          overEntries(properties),
          notCustomProperty,
      ),
      ([k, v]) => {

        const [value, priority] = stypSplitPriority(v);

        style.set(hyphenateStyleName(k), `${value}`, priority);
      },
  );

  producer.render(properties, { writer: style });
}

/**
 * @internal
 */
function notCustomProperty(
    entry: ObjectEntry<StypProperties>,
): entry is ObjectEntry<Required<StypProperties>, string> {

  const [key, value] = entry;

  if (value == null) {
    return false;
  }

  const first = String(key)[0];

  return first >= 'a' && first <= 'z' || first >= 'A' && first <= 'Z';
}
