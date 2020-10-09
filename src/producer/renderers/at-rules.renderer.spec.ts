import { EventSupply, eventSupply } from '@proc7ts/fun-events';
import { stypRoot, StypRule } from '../../rule';
import { stypTextFormat, StypTextFormatConfig } from '../formats';
import { produceStyle } from '../produce-style';
import { StypRenderer } from '../renderer';

describe('stypRenderAtRules', () => {

  let root: StypRule;
  let done: EventSupply;

  beforeEach(() => {
    root = stypRoot();
    done = eventSupply();
  });
  afterEach(() => {
    done.off();
  });

  it('does not append at-rules to non-grouping target', () => {

    const renderer: StypRenderer = {
      order: -Infinity,
      render(producer, properties) {
        producer.render(properties, { writer: producer.addStyle() });
      },
    };

    root.rules.add({ c: 'screen-only', $: '@media=screen' }, { display: 'block' });
    expect(printCSS({ renderer })).toEqual([
      '.screen-only {',
      '  display: block;',
      '}',
    ]);
  });
  it('appends at-rule to grouping target', () => {
    root.rules.add({ c: 'screen-only', $: '@media=screen' }, { display: 'block' });
    expect(printCSS()).toEqual([
      '@media screen {',
      '  .screen-only {',
      '    display: block;',
      '  }',
      '}',
    ]);
  });
  it('recognizes qualified at-rule qualifiers', () => {
    root.rules.add({ c: 'screen-only', $: '@media:scr:sm=screen' }, { display: 'block' });
    expect(printCSS()).toEqual([
      '@media screen {',
      '  .screen-only {',
      '    display: block;',
      '  }',
      '}',
    ]);
  });
  it('handles named at-rule qualifiers', () => {

    const rule = root.rules.add({ c: 'screen-only', $: '@media:scr' }, { '@media:scr': 'screen', margin: '10px' });

    rule.rules.add({ c: 'small', $: '@media:scr=(max-width:620px)' }, { margin: 0 });

    expect(printCSS()).toEqual([
      '@media screen {',
      '  .screen-only {',
      '    margin: 10px;',
      '  }',
      '}',
      '@media screen and (max-width:620px) {',
      '  .screen-only .small {',
      '    margin: 0;',
      '  }',
      '}',
    ]);
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
    expect(printCSS()).toEqual([
      '@media screen and (max-width:620px) {',
      '  .screen-only>.nested {',
      '    display: block;',
      '  }',
      '}',
    ]);
  });
  it('supports at-rule qualifiers without values', () => {
    root.rules.add({ c: 'paged', $: '@page' }, { display: 'block' });
    expect(printCSS()).toEqual([
      '@page {',
      '  display: block;',
      '}',
    ]);
  });
  it('respects non-at-rule qualifiers', () => {
    root.rules.add({ c: 'qualified', $: ['@media=print', 'other'] }, { display: 'block' });
    expect(printCSS()).toEqual([
      '@media print {',
      '  .qualified {',
      '    display: block;',
      '  }',
      '}',
    ]);
  });
  it('does not append at-rules to non-at-rules qualified rules', () => {
    root.rules.add({ c: 'qualified', $: ['non-at-rule'] }, { display: 'block' });
    expect(printCSS()).toEqual([
      '.qualified {',
      '  display: block;',
      '}',
    ]);
  });

  function printCSS(config?: StypTextFormatConfig): string[] {

    const format = stypTextFormat(config);
    const sheets = new Map<string, string>();

    format.onSheet(({ id, css }) => {
      if (css) {
        sheets.set(id, css);
      } else {
        sheets.delete(id);
      }
    }).needs(done);

    produceStyle(root.rules, format).needs(done);

    return [...sheets.values()].join('\n').split('\n');
  }
});
