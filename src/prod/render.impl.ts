import { StypRender } from './render';
import { StypOptions } from './style-producer';
import { stypRenderProperties } from './properties.render';

/**
 * @internal
 */
export function isCSSRuleGroup(sheetOrRule: CSSStyleSheet | CSSRule): sheetOrRule is (CSSGroupingRule | CSSStyleSheet) {
  return 'cssRules' in sheetOrRule;
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
    factories = render.map(stypRenderFactory);
  } else {
    factories = [stypRenderFactory(render)];
  }
  factories.push(stypRenderFactory(stypRenderProperties));
  factories.sort(compareStypRenders);

  return factories;
}

function stypRenderFactory(render: StypRender): StypRender.Factory {
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

/**
 * @internal
 */
export function compareStypRenders(first: StypRender.Factory, second: StypRender.Factory): number {

  const firstOrder = first.order || 0;
  const secondOrder = second.order || 0;

  return firstOrder > secondOrder ? 1 : firstOrder < secondOrder ? -1 : 0;
}
