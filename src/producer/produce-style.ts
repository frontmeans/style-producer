/**
 * @packageDocumentation
 * @module style-producer
 */
import { EventSupply } from 'fun-events';
import { isReadonlyArray } from '../internal';
import { StypRules } from '../rule';
import { stypRenderAtRules } from './at-rules.renderer';
import { stypRenderGlobals } from './globals.renderer';
import { produceBasicStyle } from './produce-basic-style';
import { StypRenderer } from './renderer';
import { StypOptions } from './style-producer';
import { stypRenderText } from './text.renderer';
import { stypRenderXmlNs } from './xml-ns.renderer';

/**
 * Produces and dynamically updates CSS stylesheets based on the given CSS rules.
 *
 * Appends `<style>` element(s) to the given parent DOM node (`document.head` by default) and updates them when CSS
 * rules change.
 *
 * This function enables all default renderers. E.g. the one supporting raw CSS text rules. If some of them are not
 * needed a [[produceBasicStyle]] variant of this function may be used instead.
 *
 * @category Rendering
 * @param rules  CSS rules to produce stylesheets for. This can be e.g. a [[StypRule.rules]] to render all rules,
 * or a result of [[StypRuleList.grab]] method call to render only matching ones.
 * @param opts  Production options.
 *
 * @returns Styles supply. Once cut off (i.e. its `off()` method is called) the produced stylesheets are removed.
 */
export function produceStyle(rules: StypRules, opts: StypOptions = {}): EventSupply {
  return produceBasicStyle(rules, { ...opts, renderer: defaultRenderers(opts.renderer) });
}

function defaultRenderers(renderer: StypRenderer | readonly StypRenderer[] | undefined): readonly StypRenderer[] {

  const result: StypRenderer[] = [
    stypRenderAtRules,
    stypRenderXmlNs,
    stypRenderGlobals,
    stypRenderText,
  ];

  if (renderer) {
    if (isReadonlyArray(renderer)) {
      result.push(...renderer);
    } else {
      result.push(renderer);
    }
  }

  return result;
}
