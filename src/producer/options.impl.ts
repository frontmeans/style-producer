import { StypOptions } from './style-producer';
import { StypRender } from './render';
import { stypRenderProperties } from './properties.render';

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
