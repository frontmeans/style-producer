import { produceStyle } from './produce-style';
import { stypRoot, StypRule } from '../rule';
import { cssStyle, cssStyles, mediaRules, removeStyleElements, scheduleNow } from '../spec';
import { StypRender } from './render';
import { stypSelectorDisplayText } from '../selector/selector-text.impl';
import { itsEmpty } from 'a-iterable';
import Mock = jest.Mock;

describe('stypRenderAtRules', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let mockRender: Mock<void, Parameters<StypRender.Function>>;

  beforeEach(() => {
    mockRender = jest.fn((producer, properties) => producer.render(properties));
  });

  afterEach(() => {
    removeStyleElements();
  });

  it('does not append at-rules to non-grouping target', () => {
    root.addRule({ c: 'screen-only', $: '@media=screen' }, { display: 'block' });
    mockRender.mockImplementation((producer, properties) => {
      producer.render(properties, { target: producer.addRule() });
    });
    doProduceStyle();
    expect(atSelector('.screen-only')).toBeNull();
    expect(itsEmpty(mediaRules()));
  });
  it('appends rule to at-rule to grouping target', () => {
    root.addRule({ c: 'screen-only', $: '@media=screen' }, { display: 'block' });
    doProduceStyle();
    expect(atSelector('.screen-only')).toBe('.screen-only');
    expect(cssStyle('.screen-only').display).toBe('block');
    expect(itsEmpty(mediaRules('screen'))).toBe(false);
  });
  it('recognizes qualified at-rule qualifiers', () => {
    root.addRule({ c: 'screen-only', $: '@media:scr:sm=screen' }, { display: 'block' });
    doProduceStyle();
    expect(atSelector('.screen-only')).toBe('.screen-only');
    expect(cssStyle('.screen-only').display).toBe('block');
    expect(itsEmpty(mediaRules('screen'))).toBe(false);
  });
  it('supports multiple at-rule qualifiers', () => {
    root.addRule([
          { c: 'screen-only', $: ['@media:scr=screen', '@media:sm=(max-width:620px)'] },
          '>',
          { c: 'nested' }
        ],
        { display: 'block' }
    );
    doProduceStyle();
    expect(atSelector('.screen-only>.nested')).toBe('.screen-only>.nested');
    expect(cssStyle('.screen-only>.nested').display).toBe('block');
    expect(itsEmpty(mediaRules('screen and (max-width:620px)'))).toBe(false);
  });
  it('supports at-rule qualifiers without values', () => {
    root.addRule({ c: 'paged', $: '@page' }, { display: 'block' });
    doProduceStyle();
    expect(atSelector('.paged')).toBe('.paged');
    expect(cssStyle('.paged').display).toBe('block');
    expect(itsEmpty(cssStyles('@page'))).toBe(false);
  });
  it('respects non-at-rule qualifiers', () => {
    root.addRule({ c: 'qualified', $: ['@media=print', 'other'] });
    doProduceStyle();
    expect(atSelector('.qualified')).toBe('.qualified@other');
    expect(itsEmpty(mediaRules('print'))).toBe(false);
  });
  it('does not append at-rules to non-at-rules qualified rules', () => {
    root.addRule({ c: 'qualified', $: ['non-at-rule'] });
    doProduceStyle();
    expect(atSelector('.qualified')).toBe('.qualified@non-at-rule');
    expect(itsEmpty(mediaRules()));
  });

  function doProduceStyle() {
    produceStyle(
        root.rules,
        {
          schedule: scheduleNow,
          render: [
            {
              order: -Infinity, // Before any render
              render: mockRender,
            },
            {
              order: -1,
              render(producer, properties) {
                // Insert into new stylesheet instead of at-rule rule as CSSOM does not implement the latter.

                const element = document.createElement('style');

                element.setAttribute('type', 'text/css');

                const selector = stypSelectorDisplayText(producer.selector);

                element.setAttribute('data-at-selector', selector);
                element.innerText = '';

                document.head.append(element);

                const atStylesheet = element.sheet as CSSStyleSheet;

                (atStylesheet as any)._atSelector = selector;

                producer.render(properties, { target: atStylesheet });
              },
            },
          ],
        });
  }

  function atSelector(selector: string): string | null {

    const parentRule = cssStyle(selector).parentRule;
    const stylesheet = parentRule.parentStyleSheet as CSSStyleSheet;

    return (stylesheet as any)._atSelector || null;
  }
});
