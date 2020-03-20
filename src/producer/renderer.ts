/**
 * @packageDocumentation
 * @module style-producer
 */
import { AfterEvent, EventKeeper } from '@proc7ts/fun-events';
import { StypProperties, StypRule } from '../rule';
import { StypSelector } from '../selector';
import { StyleProducer } from './style-producer';

/**
 * CSS stylesheet renderer interface.
 *
 * A renderer may be supplied to style producer to perform additional rendering tasks. E.g. to render raw CSS text,
 * or add media queries support.
 *
 * Renderers are chained in order. When renderer calls [[StyleProducer.render]] method it actually calls the next
 * renderer in chain to render properties. Thus it may alter properties, CSS selector, or target stylesheet.
 *
 * Renderer is either a function, a descriptor object, or renderer factory.
 *
 * @category Rendering
 */
export type StypRenderer = StypRenderer.Function | StypRenderer.Descriptor | StypRenderer.Factory;

export namespace StypRenderer {

  /**
   * CSS rendering options.
   *
   * These are the options passed to [[StyleProducer.render]] method.
   */
  export interface Options {

    /**
     * CSS stylesheet or rule to add properties to.
     *
     * When omitted the one from style producer is used.
     */
    target?: CSSStyleSheet | CSSRule;

    /**
     * Normalized CSS selector of the rule to render.
     *
     * When omitted the one from style producer is used.
     */
    selector?: StypSelector.Normalized;

  }

  /**
   * CSS stylesheet renderer function signature.
   *
   * It should normally call a [[StyleProducer.render]] method as the last operation to allow other renderers in chain
   * to do their job.
   */
  export type Function =
  /**
   * @param producer  Style producer instance.
   * @param properties  CSS properties to render.
   */
      (this: void, producer: StyleProducer, properties: StypProperties) => void;

  /**
   * CSS stylesheet renderer descriptor.
   */
  export interface Descriptor {

    /**
     * Rendering order.
     *
     * Equals to zero when not specified, which means it will be invoked right before the basic renderer that renders
     * CSS properties.
     */
    readonly order?: number;

    /**
     * A renderer or renderers this one requires.
     */
    readonly needs?: StypRenderer | StypRenderer[];

    /**
     * Renders CSS stylesheet.
     *
     * It should normally call a [[StyleProducer.render]] method as the last operation to allow other renderers in chain
     * to do their job.
     *
     * @param producer  Style producer instance.
     * @param properties  CSS properties to render.
     */
    render(producer: StyleProducer, properties: StypProperties): void;

  }

  /**
   * CSS stylesheet renderer factory.
   */
  export interface Factory {

    /**
     * Rendering order.
     *
     * Equals to zero when not specified, which means it will be invoked right before the basic renderer that renders
     * CSS properties.
     */
    readonly order?: number;

    /**
     * A renderer or renderers this one requires.
     */
    readonly needs?: StypRenderer | StypRenderer[];

    /**
     * Creates CSS stylesheet renderer function.
     *
     * This is called once per rule. The returned renderer function is used then to render and update a style for the
     * `rule`.
     *
     * @param rule  CSS rule to create renderer for.
     *
     * @returns A renderer function or specifier to use.
     */
    create(rule: StypRule): Function | Spec;

  }

  /**
   * CSS stylesheet renderer specifier.
   */
  export interface Spec {

    /**
     * Renders CSS stylesheet.
     *
     * It should normally call a [[StyleProducer.render]] method as the last operation to allow other renderers in chain
     * to do their job.
     *
     * @param producer  Style producer instance.
     * @param properties  CSS properties to render.
     */
    render(producer: StyleProducer, properties: StypProperties): void;

    /**
     * Reads or converts CSS properties from the rule.
     *
     * The style producer will receive CSS properties from the returned event keeper.
     *
     * When omitted the original properties will be used instead.
     *
     * @param properties  `AfterEvent` keeper of CSS rule properties. This is either the one from CSS rule,
     * or the one returned from previous renderer specifier in renderers chain.
     *
     * @returns CSS properties event keeper.
     */
    read?(properties: AfterEvent<[StypProperties]>): EventKeeper<[StypProperties]>;

  }

}
