/**
 * @packageDocumentation
 * @module @frontmeans/style-producer
 */
import { NamespaceDef, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import { newRenderSchedule } from '@frontmeans/render-scheduler';
import { AfterEvent, afterSupplied, onSupplied } from '@proc7ts/fun-events';
import { noop, Supply } from '@proc7ts/primitives';
import { itsReduction, mapIt } from '@proc7ts/push-iterator';
import { StypProperties, StypRule, StypRules } from '../rule';
import { StypSelector, stypSelector, StypSelectorFormat, stypSelectorText } from '../selector';
import { isCombinator } from '../selector/selector.impl';
import { StypFormat } from './format';
import { stypRenderFactories } from './formats/format.impl';
import { StypRenderer } from './renderer';
import { StyleProducer } from './style-producer';
import { StypWriter } from './writer';

/**
 * Produces and dynamically updates basic CSS stylesheets based on the given CSS rules.
 *
 * Unlike {@link produceStyle}, this function does not enable renderers but the basic one which just renders CSS
 * properties. This can be used to save the bundle size by enabling only select renderers.
 *
 * @category Rendering
 * @param rules - CSS rules to produce stylesheets for. This can be e.g. a {@link StypRule.rules} to render all rules,
 * or a result of {@link StypRuleList.grab} method call to render only matching ones.
 * @param format - Production options.
 *
 * @returns Styles supply. Once cut off (i.e. its `off()` method is called) the produced stylesheets are removed.
 */
export function produceBasicStyle(rules: StypRules, format: StypFormat): Supply {

  const {
    rootSelector = { e: 'body' },
    scheduler = newRenderSchedule,
    nsAlias = newNamespaceAliaser(),
  } = format;
  const supply = new Supply();
  const selectorFormat: StypSelectorFormat = { nsAlias };
  const factories = stypRenderFactories(format);
  const renderSupply = renderRules(rules);
  const trackSupply = trackRules();

  return supply.as(renderSupply).as(trackSupply);

  function styleProducer(
      rule: StypRule,
      renderer: StypRenderer.Function,
      production: {
        sheet: StypWriter.Sheet;
        writer: StypWriter;
        selector: StypSelector.Normalized;
      },
  ): StyleProducer {

    class StyleProducer$ implements StyleProducer {

      get supply(): Supply {
        return supply;
      }

      get rule(): StypRule {
        return rule;
      }

      get sheet(): StypWriter.Sheet {
        return production.sheet;
      }

      get writer(): StypWriter {
        return production.writer;
      }

      get selector(): StypSelector.Normalized {
        return production.selector;
      }

      nsAlias(ns: NamespaceDef): string {
        return nsAlias(ns);
      }

      render(properties: StypProperties, options?: StypRenderer.Options): void {
        if (!options) {
          renderer(this, properties);
        } else {
          renderer(
              styleProducer(
                  rule,
                  renderer,
                  {
                    sheet: production.sheet,
                    writer: options.writer || production.writer,
                    selector: options.selector || production.selector,
                  },
              ),
              properties,
          );
        }
      }

      addStyle(_selector: StypSelector.Normalized = production.selector): StypWriter.Style {

        const { writer } = production;

        if (!writer.isGroup) {
          return writer;
        }

        return writer.addStyle(selectorText(_selector));
      }

    }

    return new StyleProducer$();
  }

  function selectorText(selector: StypSelector.Normalized): string {
    return stypSelectorText(selector, selectorFormat);
  }

  function renderRules(rulesToRender: Iterable<StypRule>): Supply {
    return itsReduction<Supply, Supply>(
        mapIt(rulesToRender, renderRule),
        (prev, supply) => new Supply().cuts(supply).cuts(prev),
        new Supply(),
    );
  }

  function trackRules(): Supply {

    const supply = new Supply();

    return onSupplied(rules)({
      supply,
      receive: (_ctx, added) => {
        added.forEach(r => renderRule(r).needs(supply));
      },
    });
  }

  function renderRule(rule: StypRule): Supply {

    const [reader, renderer] = rendererForRule(rule);
    let sheet: StypWriter.Sheet | undefined;
    const selector = ruleSelector(rule);
    const schedule = scheduler();

    return reader(renderProperties).whenOff(removeStyle);

    function renderProperties(properties: StypProperties): void {
      schedule(() => {
        sheet?.clear();

        const producer = styleProducer(
            rule,
            renderer,
            {
              get sheet(): StypWriter.Sheet {
                if (!sheet) {
                  sheet = format.addSheet(producer);
                }
                return sheet;
              },
              get writer(): StypWriter.Sheet {
                return this.sheet;
              },
              selector,
            },
        );

        producer.render(properties);
        sheet?.done();
      });
    }

    function removeStyle(): void {
      schedule(() => {

        const lastSheet = sheet;

        if (lastSheet) {
          sheet = undefined;
          return lastSheet.remove();
        }
        // Otherwise element is removed before anything rendered.
        // Should never happen for properly constructed rule.
      });
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

  function rendererForRule(rule: StypRule): [AfterEvent<[StypProperties]>, StypRenderer.Function] {

    const specs = factories.map(factory => factory.create(rule));
    const reader = specs.reduce(
        (read, spec) => spec.read ? afterSupplied(spec.read(read)) : read,
        rule.read,
    );

    return [reader, renderAt(0)];

    function renderAt(index: number): StypRenderer.Function {
      return (producer, properties) => {

        const nextIndex = index + 1;
        let nextRenderer: StypRenderer.Function;

        if (nextIndex === factories.length) {
          nextRenderer = noop;
        } else {
          nextRenderer = renderAt(nextIndex);
        }

        const nextProducer = styleProducer(producer.rule, nextRenderer, producer);

        specs[index].render(nextProducer, properties);
      };
    }
  }
}
