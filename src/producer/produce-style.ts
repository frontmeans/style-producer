import { EventInterest } from 'fun-events';
import { isReadonlyArray } from '../internal';
import { StypRules } from '../rule';
import { stypRenderAtRules } from './at-rules.render';
import { stypRenderGlobals } from './globals.render';
import { produceBasicStyle } from './produce-basic-style';
import { StypRender } from './render';
import { StypOptions } from './style-producer';
import { stypRenderText } from './text.render';

/**
 * Produces and dynamically updates CSS stylesheets based on the given CSS rules.
 *
 * Appends `<style>` element(s) to the given parent DOM node (`document.head` by default) and updates them when CSS
 * rules change.
 *
 * This function enables all default renders. E.g. the one supporting raw CSS text rules. If you don't need all of them
 * you may prefer a `produceBasicStyle()` variant of this function.
 *
 * @param rules CSS rules to produce stylesheets for. This can be e.g. a `StypRule.rules` to render all rules,
 * or a result of `StypRuleList.grab()` method call to render only matching ones.
 * @param opts Production options.
 *
 * @returns Event interest instance. When this interest is lost (i.e. its `off()` method is called) the produced
 * stylesheets are removed.
 */
export function produceStyle(rules: StypRules, opts: StypOptions = {}): EventInterest {
  return produceBasicStyle(rules, { ...opts, render: defaultRenders(opts.render) });
}

function defaultRenders(render: StypRender | readonly StypRender[] | undefined): readonly StypRender[] {

  const result: StypRender[] = [
    stypRenderAtRules,
    stypRenderGlobals,
    stypRenderText,
  ];

  if (render) {
    if (isReadonlyArray(render)) {
      result.push(...render);
    } else {
      result.push(render);
    }
  }

  return result;
}
