/**
 * @packageDocumentation
 * @module @frontmeans/style-producer
 */
import { Supply } from '@proc7ts/primitives';
import { StypRules } from '../rule';
import { StypFormat } from './format';
import { produceBasicStyle } from './produce-basic-style';
import { defaultStypRenderers } from './renderers/default-renderers.impl';

/**
 * Produces and dynamically updates CSS stylesheets based on the given CSS rules.
 *
 * Appends `<style>` element(s) to the given parent DOM node (`document.head` by default) and updates them when CSS
 * rules change.
 *
 * This function enables all default renderers. E.g. the one supporting raw CSS text rules. If some of them are not
 * needed a {@link produceBasicStyle} variant of this function may be used instead.
 *
 * @category Rendering
 * @param rules - CSS rules to produce stylesheets for. This can be e.g. a {@link StypRule.rules} to render all rules,
 * or a result of {@link StypRuleList.grab} method call to render only matching ones.
 * @param format - Production format.
 *
 * @returns Styles supply. Once cut off (i.e. its `off()` method is called) the produced stylesheets are removed.
 */
export function produceStyle(rules: StypRules, format: StypFormat): Supply {
  return produceBasicStyle(rules, { ...format, renderer: defaultStypRenderers(format.renderer) });
}


