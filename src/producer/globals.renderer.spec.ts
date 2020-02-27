import Mocked = jest.Mocked;
import { StypLength, StypURL } from '../value';
import { stypRenderGlobals } from './globals.renderer';
import { StypRenderer } from './renderer';
import { StyleProducer } from './style-producer';

describe('stypRenderGlobals', () => {

  let sheet: Mocked<CSSStyleSheet>;
  let producer: Mocked<StyleProducer>;

  beforeEach(() => {
    sheet = {
      insertRule: jest.fn((_rule: string, index: number) => index),
    } as any;
    producer = {
      styleSheet: sheet,
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
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace url(\'http://www.w3.org/1999/xhtml\');', 0);
  });
  it('does not render incompatible default namespace', () => {
    renderer(producer, { '@namespace': 123 });
    expect(sheet.insertRule).not.toHaveBeenCalled();
  });
  it('renders namespace prefix', () => {
    renderer(producer, { '@namespace:svg': 'http://www.w3.org/2000/svg' });
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace svg url(\'http://www.w3.org/2000/svg\');', 0);
  });
  it('does not render incompatible namespace', () => {
    renderer(producer, { '@namespace:svg': StypLength.of(16, 'px') });
    expect(sheet.insertRule).not.toHaveBeenCalled();
  });
  it('renders multiple namespaces', () => {
    renderer(producer, {
      '@namespace:svg': 'http://www.w3.org/2000/svg',
      '@namespace:math': 'http://www.w3.org/1998/Math/MathML',
    });
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace svg url(\'http://www.w3.org/2000/svg\');', 0);
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace math url(\'http://www.w3.org/1998/Math/MathML\');', 1);
  });
  it('renders namespaces after imports', () => {
    renderer(producer, {
      '@namespace:math': 'http://www.w3.org/1998/Math/MathML',
      '@import:some.css': '',
      '@namespace:svg': 'http://www.w3.org/2000/svg',
    });
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace math url(\'http://www.w3.org/1998/Math/MathML\');', 0);
    expect(sheet.insertRule).toHaveBeenCalledWith('@import url(\'some.css\');', 0);
    expect(sheet.insertRule).toHaveBeenCalledWith('@namespace svg url(\'http://www.w3.org/2000/svg\');', 2);
  });
});
