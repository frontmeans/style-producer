import { stypRoot, StypRule } from '../../rule';
import { StypRGB } from '../../value/color';
import { produceStyle } from '../produce-style';
import { stypTextFormat, StypTextFormatConfig } from './text.format';

describe('stypTextFormat', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  it('pretty prints by default', () => {
    root.rules.add({ c: 'test' }, { display: 'block' });
    expect(printCSS()).toEqual([
        'body {}',
        '.test {\n'
        + '  display: block;\n'
        + '}',
    ]);
  });
  it('pretty prints when `pretty` set to `true`', () => {
    root.rules.add({ c: 'test' }, { display: 'block', color: 'white' });
    expect(printCSS({ pretty: true })).toEqual([
      'body {}',
      '.test {\n'
      + '  display: block;\n'
      + '  color: white;\n'
      + '}',
    ]);
  });
  it('compacts output when `pretty` set to `false`', () => {
    root.rules.add({ c: 'test' }, { display: 'block', color: 'white' });
    expect(printCSS({ pretty: false })).toEqual([
      'body{}',
      '.test{display:block;color:white}',
    ]);
  });
  it('renders global at-rules', () => {
    root.set({ '@import:path/to/included.css': '' });
    expect(printCSS()).toEqual([
      '@import url(\'path/to/included.css\');\n'
      + 'body {}',
    ]);
  });
  it('renders grouping at-rule with the given indentation', () => {
    root.rules.add({ c: 'test', $: '@media=screen' }, { display: 'block' });
    expect(printCSS({ pretty: { indent: ' ' } })).toEqual([
      'body {}',
      '@media screen {\n'
      + ' .test {\n'
      + '  display: block;\n'
      + ' }\n'
      + '}',
    ]);
  });
  it('renders plain CSS', () => {
    root.rules.add({ c: 'test' }, 'display: block;');
    expect(printCSS()).toEqual([
      'body {}',
      '.test {\n'
      + 'display: block;\n'
      + '}',
    ]);
  });
  it('renders plain CSS and indents the following property', () => {
    root.rules.add({ c: 'test' }, '  display: block;  ').add({ color: 'white' });
    expect(printCSS()).toEqual([
      'body {}',
      '.test {\n'
      + 'display: block;\n'
      + '  color: white;\n'
      + '}',
    ]);
  });
  it('renders plain CSS without closing semicolon', () => {
    root.rules.add({ c: 'test' }, ' display: block\n');
    expect(printCSS()).toEqual([
      'body {}',
      '.test {\n'
      + 'display: block;\n'
      + '}',
    ]);
  });
  it('renders plain CSS without closing semicolon and indents the following property', () => {
    root.rules.add({ c: 'test' }, '   display: block').add({ color: 'white' });
    expect(printCSS()).toEqual([
      'body {}',
      '.test {\n'
      + 'display: block;\n'
      + '  color: white;\n'
      + '}',
    ]);
  });
  it('renders priority', () => {
    root.rules.add({ c: 'test' }, { color: new StypRGB({ r: 0, g: 255, b: 0, a: 0.5 }).prioritize(10) });
    expect(printCSS()).toEqual([
      'body {}',
      '.test {\n'
      + '  color: rgba(0, 255, 0, 0.5) !important;\n'
      + '}',
    ]);
  });

  function printCSS(config?: StypTextFormatConfig): string[] {

    const sheets = new Map<string, string>();
    const format = stypTextFormat(config);
    const supply = format.onSheet(({ id, css }) => sheets.set(id, css));

    produceStyle(root.rules, format).cuts(supply).off();

    return Array.from(sheets.values());
  }

});
