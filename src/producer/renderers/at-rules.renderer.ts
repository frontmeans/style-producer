/**
 * @packageDocumentation
 * @module @frontmeans/style-producer
 */
import { AfterEvent, mapAfter } from '@proc7ts/fun-events';
import { filterIt, itsReduction, ObjectEntry, overEntries } from '@proc7ts/push-iterator';
import { isNotEmptyArray } from '../../internal';
import { StypProperties, StypRule } from '../../rule';
import { mergeStypProperties } from '../../rule/properties.impl';
import { StypSelector, stypSelector } from '../../selector';
import { isCombinator } from '../../selector/selector.impl';
import { stypSplitPriority, StypValue } from '../../value';
import { StypRenderer } from '../renderer';
import { StyleProducer } from '../style-producer';
import { FIRST_RENDER_ORDER } from './renderer.impl';

/**
 * @internal
 */
class AtRulesRenderer implements StypRenderer.Spec {

  constructor(private readonly _rule: StypRule) {
  }

  read(properties: AfterEvent<[StypProperties]>): AfterEvent<[StypProperties]> {

    let outer = this._rule.outer;

    while (outer) {
      properties = mergeStypProperties(outer.read.do(mapAfter(onlyAtProperties)), properties);
      outer = outer.outer;
    }

    return properties;
  }

  render(producer: StyleProducer, properties: StypProperties): void {

    const { selector } = producer;
    let { writer } = producer;

    if (!writer.isGroup) {
      producer.render(properties);
      return;
    }

    let sheet = writer;
    const extracted = extractAtSelectors(selector);

    if (!extracted) {
      producer.render(properties);
      return;
    }

    const [atSelectors, restSelector] = extracted;

    for (const atSelector of atSelectors) {

      const [name, params] = buildAtSelector(properties, atSelector);

      if (params) {
        writer = sheet = sheet.addGroup(name, params);
      } else {
        writer = sheet.addStyle(name);
        break;
      }
    }

    producer.render(properties, { writer, selector: restSelector });
  }

}

/**
 * @internal
 */
function buildAtSelector(
    properties: StypProperties,
    [key, [names, customQuery]]: [string, [Set<string>, string?]],
): [string, string?] {

  let query = '';
  const addQuery = (q?: StypValue): void => {
    if (q) {
      if (query) {
        query += ' and ';
      }
      query += q;
    }
  };

  for (const name of names) {

    const [namedQuery] = stypSplitPriority(properties[name]);

    addQuery(namedQuery);
  }

  addQuery(customQuery);

  return query ? [key, query] : [key];
}

/**
 * CSS stylesheet renderer of at-rules like `@media` queries.
 *
 * At-rules are represented by qualifiers which names start with `@` symbol. Qualifier names are used as at-rules keys,
 * and their values - as queries. If the rest of the selector is not empty, then properties are rendered in CSS
 * rule nested inside at-rule. Otherwise the properties are rendered in at-rule.
 *
 * So, for example CSS rule with `{ c: 'screen-only', $: '@media=screen' }` selector would be rendered as
 * ```css
 * @media screen {
 *   .screen-only {
 *      \/* CSS properties *\/
 *   }
 * }
 * ```
 *
 * Another option is to use named at-rules qualifiers. When named qualifier is used, the corresponding property is
 * searched in CSS rule and all of its outer rules. The values of all matching properties are used as queries.
 *
 * So the above example could be written as: `{ c: 'screen-only', $: '@media:screen' }` if CSS rule (or its outer
 * one) contains property `@media:screen` with value `screen`.
 *
 * Enabled by default in [[produceStyle]] function.
 *
 * @category Rendering
 */
export const stypRenderAtRules: StypRenderer = {

  order: FIRST_RENDER_ORDER,

  create(rule) {
    return new AtRulesRenderer(rule);
  },

};

/**
 * @internal
 */
function onlyAtProperties(properties: StypProperties): StypProperties {
  return itsReduction(
      filterIt<ObjectEntry<StypProperties>, ObjectEntry<StypProperties, string>>(
          overEntries(properties),
          isAtEntry,
      ),
      (result: StypProperties.Mutable, [key, value]: ObjectEntry<StypProperties, string>) => {
        result[key] = value;
        return result;
      },
      {},
  );
}

/**
 * @internal
 */
function isAtEntry(entry: ObjectEntry<StypProperties>): entry is ObjectEntry<StypProperties, string> {
  return String(entry[0])[0] === '@';
}

/**
 * @internal
 */
function extractAtSelectors(
    selector: StypSelector.Normalized,
): [Map<string, [Set<string>, string?]>, StypSelector.Normalized] | undefined {

  const atSelectors = new Map<string, [Set<string>, string?]>();
  const rest: StypSelector.Mutable = [];

  for (const part of selector) {
    if (isCombinator(part)) {
      rest.push(part);
    } else {
      rest.push(extractPartAtSelectors(part, atSelectors));
    }
  }

  if (!atSelectors.size) {
    return; // No at-rule qualifiers found.
  }

  return [atSelectors, stypSelector(rest)];
}

/**
 * @internal
 */
function extractPartAtSelectors(
    part: StypSelector.NormalizedPart,
    atSelectors: Map<string, [Set<string>, string?]>,
): StypSelector.NormalizedPart {

  const qualifiers = part.$;

  if (!qualifiers) {
    return part;
  }

  const restQualifies: string[] = [];

  for (const qualifier of qualifiers) {
    if (qualifier[0] === '@') {
      addAtSelector(atSelectors, qualifier);
    } else {
      restQualifies.push(qualifier);
    }
  }

  if (restQualifies.length === qualifiers.length) {
    return part; // No at-rule qualifiers found
  }
  if (isNotEmptyArray(restQualifies)) {
    return { ...part, $: restQualifies };
  }

  return { ...part, $: undefined };
}

/**
 * @internal
 */
function addAtSelector(atSelectors: Map<string, [Set<string>, string?]>, qualifier: string): void {

  const eqIdx = qualifier.indexOf('=');
  let name: string;
  let query: string | undefined;

  if (eqIdx < 0) {
    name = qualifier;
  } else {
    name = qualifier.substring(0, eqIdx);
    query = qualifier.substring(eqIdx + 1);
  }

  const colonIdx = name.indexOf(':');
  const key = colonIdx < 0 ? name : name.substring(0, colonIdx);
  const atSelector = atSelectors.get(key);

  if (!atSelector) {
    atSelectors.set(key, [new Set<string>().add(name), query]);
  } else {

    const [names, prevQuery] = atSelector;

    names.add(name);
    if (query) {
      atSelector[1] = prevQuery ? `${prevQuery} and ${query}` : query;
    }
  }
}
