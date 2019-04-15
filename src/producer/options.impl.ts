import { StypOptions } from './style-producer';
import { StypRender } from './render';
import { stypRenderProperties } from './properties.render';
import { StypRule } from '../rule';

export interface StypRenderSpecFactory extends StypRender.Factory {
  create(rule: StypRule): StypRender.Spec;
}

/**
 * @internal
 */
export function stypRenderFactories(opts: StypOptions): StypRenderSpecFactory[] {

  const render = opts.render;
  let factories: StypRenderSpecFactory[];

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

function renderFactory(render: StypRender): StypRenderSpecFactory {
  if (typeof render === 'function') {
    return {
      create() {
        return { render };
      }
    };
  }
  if (isFactory(render)) {
    return {
      order: render.order,
      create(rule) {
        return renderSpec(render.create(rule));
      },
    };
  }

  const doRender = render.render.bind(render);

  return {
    order: render.order,
    create() {
      return { render: doRender };
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

function renderSpec(render: ReturnType<StypRender.Factory['create']>): StypRender.Spec {
  return typeof render === 'function' ? { render } : render;
}
