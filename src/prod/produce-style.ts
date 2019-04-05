import { StypProperties, StypRule, StypRules } from '../rule';
import { eventInterest, EventInterest, onEventFrom } from 'fun-events';
import { filterIt, itsEach, itsReduction, mapIt, ObjectEntry, overEntries } from 'a-iterable';
import { StypSelector, stypSelector, stypSelectorText } from '../selector';
import { IMPORTANT_CSS_SUFFIX } from '../internal';
import { noop } from 'call-thru';
import { StyleProducer, StypOptions } from './style-producer';
import hyphenateStyleName from 'hyphenate-style-name';

/**
 * Produces and dynamically updates CSS stylesheets based on the given CSS rules..
 *
 * Appends `<style>` element(s) to the given parent DOM node (`document.head` by default) and updates them when CSS
 * rules change.
 *
 * @param rules CSS rules to produce stylesheets by. This can be either `StypRule.rules` to render all rules,
 * or a result of `StypRule.grab()` method call to render only matching ones.
 * @param opts Production options.
 *
 * @returns Event interest instance. When this interest is lost (i.e. its `off()` method is called) the produced
 * stylesheets are removed.
 */
export function produceStyle(rules: StypRules, opts: StypOptions = {}): EventInterest {

  const {
    document = window.document,
    rootSelector = { e: 'body' },
    render = renderStypRule,
    schedule = scheduleInAnimationFrame,
  } = opts;
  const {
    parent = document.head,
  } = opts;
  const view = document.defaultView || window;

  class Styp implements StyleProducer {

    constructor(readonly rule: StypRule) {
    }

    get document() {
      return document;
    }

    get parent() {
      return parent;
    }

    render(sheet: CSSStyleSheet, properties: StypProperties): void {

      let selector = this.rule.selector;

      if (!selector.length) {
        // Use configured root selector
        selector = stypSelector(rootSelector);
      }

      renderCssProperties(sheet, selector, properties);
      renderCssText(sheet, selector, properties);
    }

  }

  const renderInterest = renderRules(rules);
  const trackInterest = trackRules();

  return eventInterest(reason => {
    trackInterest.off(reason);
    renderInterest.off(reason);
  }).needs(renderInterest).needs(trackInterest);

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
    return onEventFrom(rules).consume(added => renderRules(added));
  }

  function renderRule(rule: StypRule): EventInterest {

    let _element: HTMLStyleElement | undefined;
    let _rev = 0;
    const producer = new Styp(rule);

    return rule.read(renderProperties).whenDone(removeStyle);

    function renderProperties(properties: StypProperties) {

      const rev = ++_rev;

      schedule(
          producer,
          () => {
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

            render(producer, sheet, properties);
          });
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

  function scheduleInAnimationFrame(producer: StyleProducer, operation: () => void) {
    view.requestAnimationFrame(operation);
  }
}

function notCustomProperty(entry: ObjectEntry<StypProperties>): entry is [string, StypProperties.Value] {
  return String(entry[0])[0] !== '$';
}

function renderStypRule(producer: StyleProducer, sheet: CSSStyleSheet, properties: StypProperties) {
  producer.render(sheet, properties);
}

function renderCssProperties(
    sheet: CSSStyleSheet,
    selector: StypSelector.Normalized,
    properties: StypProperties): void {

  const ruleIndex = sheet.insertRule(`${stypSelectorText(selector)}{}`, sheet.cssRules.length);
  const cssRule = sheet.cssRules[ruleIndex] as CSSStyleRule;
  const { style } = cssRule;

  itsEach(
      filterIt<ObjectEntry<StypProperties>, [string, StypProperties.Value]>(
          overEntries(properties),
          notCustomProperty),
      ([key, value]) => {
        value = String(value);

        let priority: 'important' | undefined;

        if (value.endsWith('!important')) {
          priority = 'important';
          value = value.substring(0, value.length - IMPORTANT_CSS_SUFFIX.length).trim();
        }

        style.setProperty(hyphenateStyleName(key), value, priority);
      });
}

function renderCssText(sheet: CSSStyleSheet, selector: StypSelector.Normalized, properties: StypProperties) {

  const css = properties.$$css;

  if (css) {
    sheet.insertRule(`${stypSelectorText(selector)}{${css}}`, sheet.cssRules.length);
  }
}
