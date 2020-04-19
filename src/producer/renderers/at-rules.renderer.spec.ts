import { itsEmpty } from '@proc7ts/a-iterable';
import { immediateRenderScheduler } from '@proc7ts/render-scheduler';
import { stypRoot, StypRule } from '../../rule';
import { stypSelectorDisplayText } from '../../selector/selector-text.impl';
import { cssStyle, cssStyles, mediaRules, removeStyleElements } from '../../spec';
import { stypObjectFormat } from '../formats';
import { produceStyle } from '../produce-style';
import { StypRenderer } from '../renderer';
import Mock = jest.Mock;

describe('stypRenderAtRules', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let mockRenderer: Mock<void, Parameters<StypRenderer.Function>>;

  beforeEach(() => {
    mockRenderer = jest.fn((producer, properties) => producer.render(properties));
  });

  afterEach(() => {
    removeStyleElements();
  });

  it('does not append at-rules to non-grouping target', () => {
    root.rules.add({ c: 'screen-only', $: '@media=screen' }, { display: 'block' });
    mockRenderer.mockImplementation((producer, properties) => {
      producer.render(properties, { writer: producer.addStyle() });
    });
    doProduceStyle();
    expect(itsEmpty(mediaRules())).toBe(true);
  });
  it('appends at-rule to grouping target', () => {
    root.rules.add({ c: 'screen-only', $: '@media=screen' }, { display: 'block' });
    doProduceStyle();
    expect(atSelector('.screen-only')).toBe('.screen-only');
    expect(cssStyle('.screen-only').display).toBe('block');
    expect(itsEmpty(mediaRules('screen'))).toBe(false);
  });
  it('recognizes qualified at-rule qualifiers', () => {
    root.rules.add({ c: 'screen-only', $: '@media:scr:sm=screen' }, { display: 'block' });
    doProduceStyle();
    expect(atSelector('.screen-only')).toBe('.screen-only');
    expect(cssStyle('.screen-only').display).toBe('block');
    expect(itsEmpty(mediaRules('screen'))).toBe(false);
  });
  it('handles named at-rule qualifiers', () => {

    const rule = root.rules.add({ c: 'screen-only', $: '@media:scr' }, { '@media:scr': 'screen' });

    rule.rules.add({ c: 'small', $: '@media:scr=(max-width:620px)' }, { display: 'block' });

    doProduceStyle();
    expect(atSelector('.screen-only .small')).toBe('.screen-only .small');
    expect(cssStyle('.screen-only .small').display).toBe('block');
    expect(itsEmpty(mediaRules('screen and (max-width:620px)'))).toBe(false);
  });
  it('supports multiple at-rule qualifiers', () => {
    root.rules.add(
        [
          { c: 'screen-only', $: ['@media:scr=screen', '@media:sm=(max-width:620px)'] },
          '>',
          { c: 'nested' },
        ],
        { display: 'block' },
    );
    doProduceStyle();
    expect(atSelector('.screen-only>.nested')).toBe('.screen-only>.nested');
    expect(cssStyle('.screen-only>.nested').display).toBe('block');
    expect(itsEmpty(mediaRules('screen and (max-width:620px)'))).toBe(false);
  });
  it('supports at-rule qualifiers without values', () => {
    root.rules.add({ c: 'paged', $: '@page' }, { display: 'block' });
    doProduceStyle();
    expect(atSelector('.paged')).toBe('.paged');
    expect(cssStyle('.paged').display).toBe('block');
    expect(itsEmpty(cssStyles('@page'))).toBe(false);
  });
  it('respects non-at-rule qualifiers', () => {
    root.rules.add({ c: 'qualified', $: ['@media=print', 'other'] });
    doProduceStyle();
    expect(atSelector('.qualified-Q-other')).toBe('.qualified@other');
    expect(itsEmpty(mediaRules('print'))).toBe(false);
  });
  it('does not append at-rules to non-at-rules qualified rules', () => {
    root.rules.add({ c: 'qualified', $: ['non-at-rule'] });
    doProduceStyle();
    expect(atSelector('.qualified-Q-non-at-rule')).toBe('.qualified@non-at-rule');
    expect(itsEmpty(mediaRules())).toBe(true);
  });

  function doProduceStyle(): void {
    produceStyle(
        root.rules,
        stypObjectFormat({
          scheduler: immediateRenderScheduler,
          renderer: [
            {
              order: -Infinity, // Before any renderer
              render: mockRenderer,
            },
            {
              order: -1,
              render(producer, properties) {
                // Insert into new stylesheet instead of at-rule rule as CSSOM does not implement the latter.

                const selector = stypSelectorDisplayText(producer.selector);
                const writer = producer.sheet.addStyle(selector.replace(/@/g, '-Q-'));

                const styles = document.head.querySelectorAll('style');
                const element = styles[styles.length - 1];

                element.setAttribute('data-at-selector', selector);

                const atStylesheet = element.sheet as CSSStyleSheet;

                (atStylesheet as any)._atSelector = selector;

                producer.render(properties, { writer });
              },
            },
          ],
        }),
    );
  }

  function atSelector(selector: string): string | null {

    const parentRule = cssStyle(selector).parentRule;
    const stylesheet = parentRule.parentStyleSheet as CSSStyleSheet;

    return (stylesheet as any)._atSelector || null;
  }
});
