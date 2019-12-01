/**
 * @module style-producer
 */
import { itsEach, itsReduction, mapIt } from 'a-iterable';
import { noop } from 'call-thru';
import { AfterEvent, afterSupplied, eventSupply, EventSupply, onSupplied } from 'fun-events';
import { NamespaceDef, newNamespaceAliaser } from 'namespace-aliaser';
import { StypProperties, StypRule, StypRules } from '../rule';
import { StypSelector, stypSelector, StypSelectorFormat, stypSelectorText } from '../selector';
import { isCombinator } from '../selector/selector.impl';
import { stypRenderFactories } from './options.impl';
import { StypRender } from './render';
import { isCSSRuleGroup } from './render.impl';
import { StyleProducer, StyleSheetRef, StypOptions } from './style-producer';

/**
 * Produces and dynamically updates basic CSS stylesheets based on the given CSS rules.
 *
 * Unlike [[produceStyle]], this function does not enable renders but the basic one which just renders CSS properties.
 * You can enable only renders you need. This is useful only if you are not going to use all of them and want to save
 * the bundle size.
 *
 * @category Rendering
 * @param rules  CSS rules to produce stylesheets for. This can be e.g. a [[StypRule.rules]] to render all rules,
 * or a result of [[StypRuleList.grab]] method call to render only matching ones.
 * @param opts  Production options.
 *
 * @returns Styles supply. Once cut off (i.e. its `off()` method is called) the produced stylesheets are removed.
 */
export function produceBasicStyle(rules: StypRules, opts: StypOptions = {}): EventSupply {

  const {
    document = window.document,
    rootSelector = { e: 'body' },
    addStyleSheet = addStyleElement,
    schedule = scheduleInAnimationFrame,
    nsAlias = newNamespaceAliaser(),
  } = opts;
  const {
    parent = document.head,
  } = opts;
  const view = document.defaultView || window;
  const format: StypSelectorFormat = { nsAlias };
  const factories = stypRenderFactories(opts);
  const renderSupply = renderRules(rules);
  const trackSupply = trackRules();

  return eventSupply(reason => {
    trackSupply.off(reason);
    renderSupply.off(reason);
  }).needs(renderSupply).needs(trackSupply);

  function styleProducer(
      rule: StypRule,
      render: StypRender.Function,
      production: {
        styleSheet: CSSStyleSheet,
        target: CSSStyleSheet | CSSRule,
        selector: StypSelector.Normalized,
      }) {

    class Styp implements StyleProducer {

      constructor() {
      }

      get document() {
        return document;
      }

      get parent() {
        return parent;
      }

      get rule() {
        return rule;
      }

      get styleSheet() {
        return production.styleSheet;
      }

      get target() {
        return production.target;
      }

      get selector() {
        return production.selector;
      }

      nsAlias(ns: NamespaceDef): string {
        return nsAlias(ns);
      }

      render(properties: StypProperties, options?: StypRender.Options): void {
        if (!options) {
          render(this, properties);
        } else {
          render(
              styleProducer(rule, render, {
                styleSheet: production.styleSheet,
                target: options.target || production.target,
                selector: options.selector || production.selector,
              }),
              properties);
        }
      }

      addRule(_selector: StypSelector.Normalized = production.selector): CSSRule {

        const target = production.target;

        if (!isCSSRuleGroup(target)) {
          return target;
        }

        const ruleIndex = target.insertRule(`${selectorText(_selector)}{}`, target.cssRules.length);

        return target.cssRules[ruleIndex];
      }

    }

    return new Styp();
  }

  function selectorText(selector: StypSelector.Normalized) {
    return stypSelectorText(selector, format);
  }

  function renderRules(rulesToRender: Iterable<StypRule>): EventSupply {
    return itsReduction<EventSupply, EventSupply>(
        mapIt(rulesToRender, renderRule),
        (prev, supply) => eventSupply(reason => {
          supply.off(reason);
          prev.off(reason);
        }),
        eventSupply(),
    );
  }

  function trackRules(): EventSupply {

    const tracked = new Map<StypRule, EventSupply>();
    const supply = onSupplied(rules)((added, removed) => {
      added.forEach(r => tracked.set(r, renderRule(r)));
      removed.forEach(r => tracked.delete(r));
    });

    return eventSupply(reason => {
      supply.off(reason);
      itsEach(tracked.values(), i => i.off(reason));
      tracked.clear();
    }).needs(supply);
  }

  function renderRule(rule: StypRule): EventSupply {

    const [ reader, render ] = renderForRule(rule);
    let _sheetRef: StyleSheetRef | undefined;
    let _rev = 0;
    const selector = ruleSelector(rule);

    return reader(renderProperties).whenOff(removeStyle);

    function renderProperties(properties: StypProperties) {

      const rev = ++_rev;

      schedule(renderScheduled);

      function renderScheduled() {
        if (_rev !== rev) {
          // Properties changed since this operation scheduled.
          // Skip their rendering.
          return;
        }

        if (_sheetRef) {
          clearProperties(_sheetRef.styleSheet);
        }

        const producer = styleProducer(
            rule,
            render,
            {
              get styleSheet() {
                if (!_sheetRef) {
                  _sheetRef = addStyleSheet(producer);
                }
                return _sheetRef.styleSheet;
              },
              get target() {
                return this.styleSheet;
              },
              selector,
            });

        producer.render(properties);
      }
    }

    function removeStyle() {
      ++_rev;

      const sheetRef = _sheetRef;

      if (sheetRef) {
        // Element removed before anything rendered.
        // Should never happen for properly constructed rule.
        _sheetRef = undefined;
        return sheetRef.remove();
      }
    }

    function clearProperties(sheet: CSSStyleSheet) {
      while (sheet.cssRules.length) {
        sheet.deleteRule(sheet.cssRules.length - 1);
      }
    }
  }

  function ruleSelector(rule: StypRule): StypSelector.Normalized {

    const selector = rule.selector;

    if (!selector.length) {
      // Use configured root selector
      return stypSelector(rootSelector);
    }
    if (isCombinator(selector[0])) {
      // First combinator is relative to root selector
      return [...stypSelector(rootSelector), ...selector];
    }

    return selector;
  }

  function renderForRule(rule: StypRule): [AfterEvent<[StypProperties]>, StypRender.Function] {

    const specs = factories.map(factory => factory.create(rule));
    const reader = specs.reduce(
        (read, spec) => spec.read ? afterSupplied(spec.read(read)) : read,
        rule.read);

    return [reader, renderAt(0)];

    function renderAt(index: number): StypRender.Function {
      return (producer, properties) => {

        const nextIndex = index + 1;
        let nextRender: StypRender.Function;

        if (nextIndex === factories.length) {
          nextRender = noop;
        } else {
          nextRender = renderAt(nextIndex);
        }

        const nextProducer = styleProducer(producer.rule, nextRender, producer);

        specs[index].render(nextProducer, properties);
      };
    }
  }

  function scheduleInAnimationFrame(operation: () => void) {
    view.requestAnimationFrame(operation);
  }
}

function addStyleElement(producer: StyleProducer): StyleSheetRef {

  const { document, parent } = producer;
  const element = document.createElement('style');

  element.setAttribute('type', 'text/css');
  element.append(document.createTextNode(''));

  parent.append(element);

  return {
    styleSheet: element.sheet as CSSStyleSheet,
    remove() {
      element.parentElement!.removeChild(element);
    },
  };
}
