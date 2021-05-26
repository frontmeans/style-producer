import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { flatMapIt } from '@proc7ts/push-iterator';
import { Supply } from '@proc7ts/supply';
import { stypRoot, StypRule } from '../../rule';
import { StypLength, StypURL } from '../../value';
import { stypTextFormat, StypTextFormatConfig } from '../formats';
import { produceStyle } from '../produce-style';
import { StypRenderer } from '../renderer';
import { StyleProducer } from '../style-producer';
import { StypWriter } from '../writer';
import { stypRenderGlobals } from './globals.renderer';

describe('stypRenderGlobals', () => {

  let sheet: StypWriter.Sheet;
  let producer: StyleProducer;

  beforeEach(() => {
    sheet = {
      addGlobal: jest.fn((name: string, value: string, index?: number) => ({ name, value, index })),
    } as any;
    producer = {
      rule: {
        selector: [],
      },
      sheet,
      render: jest.fn(),
    } as any;
  });

  let renderer: StypRenderer.Function;

  beforeEach(() => {

    const rendererDesc = stypRenderGlobals as StypRenderer.Descriptor;

    renderer = rendererDesc.render.bind(rendererDesc);
  });

  it('renders default namespace', () => {
    renderer(producer, { '@namespace': new StypURL('http://www.w3.org/1999/xhtml') });
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'url("http://www.w3.org/1999/xhtml")', 0);
  });
  it('does not render incompatible default namespace', () => {
    renderer(producer, { '@namespace': 123 });
    expect(sheet.addGlobal).not.toHaveBeenCalled();
  });
  it('renders namespace prefix', () => {
    renderer(producer, { '@namespace:svg': 'http://www.w3.org/2000/svg' });
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'svg url("http://www.w3.org/2000/svg")', 0);
  });
  it('does not render incompatible namespace', () => {
    renderer(producer, { '@namespace:svg': StypLength.of(16, 'px') });
    expect(sheet.addGlobal).not.toHaveBeenCalled();
  });
  it('renders multiple namespaces', () => {
    renderer(producer, {
      '@namespace:svg': 'http://www.w3.org/2000/svg',
      '@namespace:math': 'http://www.w3.org/1998/Math/MathML',
    });
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'svg url("http://www.w3.org/2000/svg")', 0);
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'math url("http://www.w3.org/1998/Math/MathML")', 1);
  });
  it('renders namespaces after imports', () => {
    renderer(producer, {
      '@namespace:math': 'http://www.w3.org/1998/Math/MathML',
      '@import:some.css': '',
      '@namespace:svg': 'http://www.w3.org/2000/svg',
    });
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'math url("http://www.w3.org/1998/Math/MathML")', 0);
    expect(sheet.addGlobal).toHaveBeenCalledWith('@import', 'url("some.css")', 0);
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'svg url("http://www.w3.org/2000/svg")', 2);
  });

  let root: StypRule;
  let done: Supply;

  beforeEach(() => {
    root = stypRoot();
    done = new Supply();
  });
  afterEach(() => {
    done.off();
  });

  it('renders imports for root style sheet only', () => {
    root.add({
      '@import:some.css': '',
      '@import:other.css': 'screen',
    });
    root.rules.add({ c: 'custom' }, { color: 'black' });
    expect(printCSS()).toEqual([
      '/***/',
      '@import url("some.css");',
      '@import url("other.css") screen;',
      '/***/',
      '.custom {',
      '  color: black;',
      '}',
    ]);
  });
  it('renders namespace declarations in each style sheet', () => {
    root.add({
      '@namespace:ns1': 'http://localhost/test/ns1',
      '@namespace:ns2': 'http://localhost/test/ns2',
    });
    root.rules.add({ c: 'custom' }, { color: 'black' });
    expect(printCSS()).toEqual([
      '/***/',
      '@namespace ns1 url("http://localhost/test/ns1");',
      '@namespace ns2 url("http://localhost/test/ns2");',
      '/***/',
      '@namespace ns1 url("http://localhost/test/ns1");',
      '@namespace ns2 url("http://localhost/test/ns2");',
      '.custom {',
      '  color: black;',
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

    return [...flatMapIt(sheets.values(), css => ['/***/', ...css.split('\n')])];
  }
});
