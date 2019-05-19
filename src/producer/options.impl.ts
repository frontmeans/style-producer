import { isReadonlyArray } from '../internal';
import { StypRule } from '../rule';
import { stypRenderProperties } from './properties.render';
import { StypRender } from './render';
import { StypOptions } from './style-producer';

export interface StypRenderSpecFactory extends StypRender.Factory {
  create(rule: StypRule): StypRender.Spec;
}

/**
 * @internal
 */
export function stypRenderFactories(opts: StypOptions): readonly StypRenderSpecFactory[] {

  const factories = new Map<StypRender, StypRenderSpecFactory>();

  addRenders(opts.render);
  factories.delete(stypRenderProperties);

  return [...factories.values(), renderFactory(stypRenderProperties)].sort(compareRenders);

  function addRenders(renders: StypRender | readonly StypRender[] | undefined) {
    if (renders) {
      if (isReadonlyArray(renders)) {
        renders.forEach(addRender);
      } else {
        addRender(renders);
      }
    }
  }

  function addRender(render: StypRender) {
    if (factories.has(render)) {
      return;
    }

    const factory = renderFactory(render);

    factories.set(render, factory);
    addRenders(factory.needs);
  }
}

function renderFactory(render: StypRender): StypRenderSpecFactory {
  if (typeof render === 'function') {
    return {
      create() {
        return { render: render as StypRender.Function<any> };
      }
    };
  }
  if (isFactory(render)) {
    return {
      order: render.order,
      needs: render.needs,
      create(rule) {
        return renderSpec(render.create(rule));
      },
    };
  }

  const doRender = render.render.bind(render);

  return {
    order: render.order,
    needs: render.needs,
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
  return typeof render === 'function' ? { render: render as StypRender.Function<any> } : render;
}
