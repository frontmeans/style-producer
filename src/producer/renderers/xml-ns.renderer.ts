import { DoqryPicker, isDoqryCombinator } from '@frontmeans/doqry';
import { NamespaceDef } from '@frontmeans/namespace-aliaser';
import { isPresent } from '@proc7ts/primitives';
import { StypProperties } from '../../rule';
import { StypURL } from '../../value';
import { StypRenderer } from '../renderer';
import { StyleProducer } from '../style-producer';
import { stypRenderGlobals } from './globals.renderer';
import { FIRST_RENDER_ORDER } from './renderer.impl';

/**
 * CSS stylesheet renderer of global XML namespace definitions.
 *
 * Renders `@namespace` declarations for CSS selectors containing namespace definitions.
 *
 * Enabled by default in {@link produceStyle} function.
 *
 * @category Rendering
 */
export const stypRenderXmlNs: StypRenderer = {
  order: FIRST_RENDER_ORDER,

  needs: stypRenderGlobals,

  render(producer: StyleProducer, properties: StypProperties) {
    const xmlNsDefs = extractXmlNsDefs(producer.selector);

    if (xmlNsDefs.length) {
      const declareNs = (
        result: StypProperties.Mutable,
        ns: NamespaceDef,
      ): StypProperties.Mutable => {
        const alias = producer.nsAlias(ns);

        result[`@namespace:${alias}`] = new StypURL(ns.url);

        return result;
      };

      producer.render(xmlNsDefs.reduce(declareNs, { ...properties }));
    } else {
      producer.render(properties);
    }
  },
};

/**
 * @internal
 */
function extractXmlNsDefs(selector: DoqryPicker): readonly NamespaceDef[] {
  return selector
    .map(part => !isDoqryCombinator(part) && part.ns && typeof part.ns !== 'string' ? part.ns : null)
    .filter(isPresent);
}
