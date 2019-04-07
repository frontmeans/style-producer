import { StypRender } from './render';
import { StypOptions } from './style-producer';
import { stypRenderProperties } from './properties.render';
import { StypSelector, stypSelectorText } from '../selector';

/**
 * @internal
 */
export function isCSSRuleGroup(sheetOrRule: CSSStyleSheet | CSSRule): sheetOrRule is (CSSGroupingRule | CSSStyleSheet) {
  return 'cssRules' in sheetOrRule;
}

/**
 * @internal
 */
export function appendCSSRule(sheetOrRule: CSSStyleSheet | CSSRule, selector: StypSelector.Normalized): CSSRule {
  if (!isCSSRuleGroup(sheetOrRule)) {
    return sheetOrRule;
  }

  const ruleIndex = sheetOrRule.insertRule(`${stypSelectorText(selector)}{}`, sheetOrRule.cssRules.length);

  return sheetOrRule.cssRules[ruleIndex];
}

/**
 * @internal
 */
export function stypRenderFactories(opts: StypOptions): StypRender.Factory[] {

  const render = opts.render;
  let factories: StypRender.Factory[];

  if (!render) {
    factories = [];
  } else if (Array.isArray(render)) {
    factories = render.map(renderFactory);
  } else {
    factories = [renderFactory(render)];
  }
  factories.push(renderFactory(stypRenderProperties));
  factories.sort(compareRenders);

  return factories;
}

function renderFactory(render: StypRender): StypRender.Factory {
  if (typeof render === 'function') {
    return {
      create() {
        return render;
      }
    };
  }
  if (isFactory(render)) {
    return render;
  }

  const doRender = render.render.bind(render);

  return {
    order: render.order,
    create() {
      return doRender;
    },
  };
}

function isFactory(render: StypRender): render is StypRender.Factory {
  return 'create' in render;
}

function compareRenders(first: StypRender.Factory, second: StypRender.Factory): number {

  const firstOrder = first.order || 0;
  const secondOrder = second.order || 0;

  return firstOrder > secondOrder ? 1 : firstOrder < secondOrder ? -1 : 0;
}
