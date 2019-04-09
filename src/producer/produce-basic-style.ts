import { StypProperties, StypRule, StypRules } from '../rule';
import { eventInterest, EventInterest, onEventFrom } from 'fun-events';
import { itsReduction, mapIt } from 'a-iterable';
import { StypSelector, stypSelector } from '../selector';
import { noop } from 'call-thru';
import { StyleProducer, StypOptions } from './style-producer';
import { StypRender } from './render';
import { stypRenderFactories } from './options.impl';

/**
 * Produces and dynamically updates basic CSS stylesheets based on the given CSS rules.
 *
 * Unlike `produceStyle()`, this function does not enable renders but the basic one which just renders CSS properties.
 * You can enable only renders you need. This is useful only if you are not going to use all of them and want to save
 * the bundle size.
 *
 * @param rules CSS rules to produce stylesheets for. This can be either `StypRule.rules` to render all rules,
 * or a result of `StypRule.grab()` method call to render only matching ones.
 * @param opts Production options.
 *
 * @returns Event interest instance. When this interest is lost (i.e. its `off()` method is called) the produced
 * stylesheets are removed.
 */
export function produceBasicStyle(rules: StypRules, opts: StypOptions = {}): EventInterest {

  const {
    document = window.document,
    rootSelector = { e: 'body' },
    schedule = scheduleInAnimationFrame,
  } = opts;
  const {
    parent = document.head,
  } = opts;
  const view = document.defaultView || window;
  const factories = stypRenderFactories(opts);
  const renderInterest = renderRules(rules);
  const trackInterest = trackRules();

  return eventInterest(reason => {
    trackInterest.off(reason);
    renderInterest.off(reason);
  }).needs(renderInterest).needs(trackInterest);

  function styleProducer(rule: StypRule, render: StypRender.Function) {

    class Styp implements StyleProducer {

      constructor() {
      }

      get rule() {
        return rule;
      }

      get document() {
        return document;
      }

      get parent() {
        return parent;
      }

      render(sheet: CSSStyleSheet, selector: StypSelector.Normalized, properties: StypProperties): void {
        render(this, sheet, selector, properties);
      }

    }

    return new Styp();
  }

  function renderRules(rulesToRender: Iterable<StypRule>): EventInterest {
    return itsReduction<EventInterest, EventInterest>(
        mapIt(rulesToRender, renderRule),
        (prev, interest) => eventInterest(reason => {
          interest.off(reason);
          prev.off(reason);
        }),
        eventInterest(noop),
    );
  }

  function trackRules(): EventInterest {
    return onEventFrom(rules).consume(renderRules);
  }

  function renderRule(rule: StypRule): EventInterest {

    let _element: HTMLStyleElement | undefined;
    let _rev = 0;
    const producer = styleProducer(rule, renderForRule(rule));
    let selector = rule.selector;

    if (!selector.length) {
      // Use configured root selector
      selector = stypSelector(rootSelector);
    }

    return rule.read(renderProperties).whenDone(removeStyle);

    function renderProperties(properties: StypProperties) {

      const rev = ++_rev;

      schedule(producer, renderScheduled);

      function renderScheduled() {
        if (_rev !== rev) {
          // Properties changed since this operation scheduled.
          // Skip their rendering.
          return;
        }

        if (!_element) {
          _element = document.createElement('style');
          _element.setAttribute('type', 'text/css');
          _element.append(document.createTextNode(''));
          parent.append(_element);
        } else {
          clearProperties(_element);
        }

        const sheet = _element.sheet as CSSStyleSheet;

        producer.render(sheet, selector, properties);
      }
    }

    function removeStyle() {
      ++_rev;

      const element = _element as HTMLStyleElement;

      if (element) {
        // Element removed before anything rendered.
        // Should never happen for properly constructed rule.
        _element = undefined;
        return element.remove();
      }
    }

    function clearProperties(styleElement: HTMLStyleElement) {

      const sheet = styleElement.sheet as CSSStyleSheet;

      while (sheet.cssRules.length) {
        sheet.deleteRule(sheet.cssRules.length - 1);
      }
    }
  }

  function renderForRule(rule: StypRule): StypRender.Function {

    const renders = factories.map(factory => factory.create(rule));

    return renderAt(0);

    function renderAt(index: number): StypRender.Function {
      return (producer, sheet, selector, properties) => {

        const nextIndex = index + 1;
        let nextRender: StypRender.Function;

        if (nextIndex === factories.length) {
          nextRender = noop;
        } else {
          nextRender = renderAt(nextIndex);
        }

        const nextProducer = styleProducer(producer.rule, nextRender);

        renders[index](nextProducer, sheet, selector, properties);
      };
    }
  }

  function scheduleInAnimationFrame(producer: StyleProducer, operation: () => void) {
    view.requestAnimationFrame(operation);
  }
}