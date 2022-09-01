import { StypProperties } from '../../rule';
import { StyleProducer } from '../style-producer';

/**
 * Renders raw CSS text. I.e. the contents of {@link StypProperties.Generic.$$css} property.
 *
 * It should be rendered before CSS properties normally to add the rendered rule as a first one.
 *
 * Enabled by default in {@link produceStyle} function.
 *
 * @category Rendering
 */
export function stypRenderText(producer: StyleProducer, properties: StypProperties): void {
  const css = properties.$$css;

  if (!css) {
    producer.render(properties);
  } else {
    const style = producer.addStyle();

    style.replace(css);
    producer.render(properties, { writer: style });
  }
}
