import { isReadonlyArray } from '../../internal';
import { StypRule } from '../../rule';
import { StypFormat } from '../format';
import { StypRenderer } from '../renderer';
import { stypRenderProperties } from '../renderers';

/**
 * @internal
 */
export interface StypRendererSpecFactory extends StypRenderer.Factory {
  create(rule: StypRule): StypRenderer.Spec;
}

/**
 * @internal
 */
export function stypRenderFactories(format: StypFormat): readonly StypRendererSpecFactory[] {

  const factories = new Map<StypRenderer, StypRendererSpecFactory>();

  addRenderers(format.renderer);
  factories.delete(stypRenderProperties);

  return [...factories.values(), rendererFactory(stypRenderProperties)].sort(compareRenderers);

  function addRenderers(renderers: StypRenderer | readonly StypRenderer[] | undefined): void {
    if (renderers) {
      if (isReadonlyArray(renderers)) {
        renderers.forEach(addRenderer);
      } else {
        addRenderer(renderers);
      }
    }
  }

  function addRenderer(renderer: StypRenderer): void {
    if (factories.has(renderer)) {
      return;
    }

    const factory = rendererFactory(renderer);

    factories.set(renderer, factory);
    addRenderers(factory.needs);
  }
}

function rendererFactory(renderer: StypRenderer): StypRendererSpecFactory {
  if (typeof renderer === 'function') {
    return {
      create() {
        return { render: renderer };
      },
    };
  }
  if (isRendererFactory(renderer)) {
    return {
      order: renderer.order,
      needs: renderer.needs,
      create(rule) {
        return rendererSpec(renderer.create(rule));
      },
    };
  }

  const render = renderer.render.bind(renderer);

  return {
    order: renderer.order,
    needs: renderer.needs,
    create() {
      return { render };
    },
  };
}

function isRendererFactory(renderer: StypRenderer): renderer is StypRenderer.Factory {
  return 'create' in renderer;
}

function compareRenderers(first: StypRenderer.Factory, second: StypRenderer.Factory): number {

  const firstOrder = first.order || 0;
  const secondOrder = second.order || 0;

  return firstOrder > secondOrder ? 1 : firstOrder < secondOrder ? -1 : 0;
}

function rendererSpec(renderer: ReturnType<StypRenderer.Factory['create']>): StypRenderer.Spec {
  return typeof renderer === 'function' ? { render: renderer } : renderer;
}
