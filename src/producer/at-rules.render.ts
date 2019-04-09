import { StypRender } from './render';
import { StyleProducer } from './style-producer';
import { StypSelector, stypSelector } from '../selector';
import { StypProperties } from '../rule';
import { isCombinator } from '../selector/selector.impl';
import { isCSSRuleGroup } from './render.impl';

/**
 * CSS stylesheet render of at-rules like `@media` queries.
 *
 * At-rules are represented by qualifiers which names start with `@` symbol. Qualifier names are used as at-rules keys,
 * and their values - as query parts. If the rest of the selector is not empty, then properties are rendered in CSS
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
 * Enabled by default in `produceStyle()` function.
 */
export const stypRenderAtRules: StypRender = {

  order: -0xffff,

  render(producer: StyleProducer, properties: StypProperties) {

    const { selector } = producer;
    let { target } = producer;

    if (!isCSSRuleGroup(target)) {
      producer.render(properties);
      return;
    }

    let sheet: CSSGroupingRule | CSSStyleSheet = target;
    const extracted = extractAtSelectors(selector);

    if (!extracted) {
      producer.render(properties);
      return;
    }

    const [atSelectors, restSelector] = extracted;

    for (const [key, [_, query]] of atSelectors) {

      const atSelector = query ? `${key} ${query}` : key;
      const ruleIdx = sheet.insertRule(`${atSelector}{}`, sheet.cssRules.length);
      const nested: CSSRule = sheet.cssRules[ruleIdx];

      target = nested;
      if (isCSSRuleGroup(nested)) {
        sheet = nested;
      }
    }

    producer.render(properties, { target, selector: restSelector });
  },

};

function extractAtSelectors(
    selector: StypSelector.Normalized):
    [Map<string, [string[], string?]>, StypSelector.Normalized] | undefined {

  const atSelectors = new Map<string, [string[], string?]>();
  const rest: StypSelector.Normalized = [];

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

function extractPartAtSelectors(
    part: StypSelector.NormalizedPart,
    atSelectors: Map<string, [string[], string?]>):
    StypSelector.NormalizedPart {

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
  if (!restQualifies.length) {
    return { ...part, $: undefined };
  }

  return { ...part, $: restQualifies as [string, ...string[]] };
}

function addAtSelector(atSelectors: Map<string, [string[], string?]>, qualifier: string) {

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
    atSelectors.set(key, [[name], query]);
  } else {

    const [names, prevValue] = atSelector;

    names.push(name);
    if (query) {
      atSelector[1] = prevValue ? `${prevValue} ${query}` : query;
    }
  }
}
