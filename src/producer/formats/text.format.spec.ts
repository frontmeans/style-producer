import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { Supply } from '@proc7ts/supply';
import { stypRoot, StypRule } from '../../rule';
import { StypRGB } from '../../value';
import { produceStyle } from '../produce-style';
import { stypTextFormat, StypTextFormatConfig } from './text.format';

describe('stypTextFormat', () => {
  let root: StypRule;
  let done: Supply;

  beforeEach(() => {
    root = stypRoot();
    done = new Supply();
  });
  afterEach(() => {
    done.off();
  });

  it('pretty prints by default', () => {
    root.rules.add({ c: 'test' }, { display: 'block' });
    expect(printCSS()).toEqual(['.test {\n' + '  display: block;\n' + '}']);
  });
  it('pretty prints when `pretty` set to `true`', () => {
    root.rules.add({ c: 'test' }, { display: 'block', color: 'white' });
    expect(printCSS({ pretty: true })).toEqual([
      '.test {\n' + '  display: block;\n' + '  color: white;\n' + '}',
    ]);
  });
  it('compacts output when `pretty` set to `false`', () => {
    root.rules.add({ c: 'test' }, { display: 'block', color: 'white' });
    expect(printCSS({ pretty: false })).toEqual(['.test{display:block;color:white}']);
  });
  it('renders global at-rules', () => {
    root.set({ '@import:path/to/included.css': '' });
    expect(printCSS()).toEqual(['@import url("path/to/included.css");']);
  });
  it('renders global at-rules before others', () => {
    root.set({ '@import:path/to/included.css': '', margin: '10px' });
    expect(printCSS()).toEqual([
      '@import url("path/to/included.css");\n' + 'body {\n' + '  margin: 10px;\n' + '}',
    ]);
  });
  it('renders grouping at-rule with the given indentation', () => {
    root.rules.add({ c: 'test', $: '@media=screen' }, { display: 'block' });
    expect(printCSS({ pretty: { indent: ' ' } })).toEqual([
      '@media screen {\n' + ' .test {\n' + '  display: block;\n' + ' }\n' + '}',
    ]);
  });
  it('renders plain CSS', () => {
    root.rules.add({ c: 'test' }, 'display: block;');
    expect(printCSS()).toEqual(['.test {\n' + 'display: block;\n' + '}']);
  });
  it('renders plain CSS and indents the following property', () => {
    root.rules.add({ c: 'test' }, '  display: block;  ').add({ color: 'white' });
    expect(printCSS()).toEqual(['.test {\n' + 'display: block;\n' + '  color: white;\n' + '}']);
  });
  it('renders plain CSS without closing semicolon', () => {
    root.rules.add({ c: 'test' }, ' display: block\n');
    expect(printCSS()).toEqual(['.test {\n' + 'display: block;\n' + '}']);
  });
  it('renders plain CSS without closing semicolon and indents the following property', () => {
    root.rules.add({ c: 'test' }, '   display: block').add({ color: 'white' });
    expect(printCSS()).toEqual(['.test {\n' + 'display: block;\n' + '  color: white;\n' + '}']);
  });
  it('renders priority', () => {
    root.rules.add(
      { c: 'test' },
      { color: new StypRGB({ r: 0, g: 255, b: 0, a: 0.5 }).prioritize(10) },
    );
    expect(printCSS()).toEqual(['.test {\n' + '  color: rgba(0, 255, 0, 0.5) !important;\n' + '}']);
  });
  it('informs on rule removal', () => {
    root.rules.add({ c: 'test' }, { display: 'block' }).remove();
    expect(printCSS()).toEqual([]);
  });

  function printCSS(config?: StypTextFormatConfig): string[] {
    const sheets = new Map<string, string>();
    const format = stypTextFormat(config);

    format
      .onSheet(({ id, css }) => {
        if (css) {
          sheets.set(id, css);
        } else {
          sheets.delete(id);
        }
      })
      .needs(done);
    produceStyle(root.rules, format).needs(done);

    return [...sheets.values()];
  }
});
