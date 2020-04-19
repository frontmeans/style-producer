import Mocked = jest.Mocked;
import { StypLength, StypURL } from '../../value';
import { StypRenderer } from '../renderer';
import { StyleProducer } from '../style-producer';
import { StypWriter } from '../writer';
import { stypRenderGlobals } from './globals.renderer';

describe('stypRenderGlobals', () => {

  let sheet: Mocked<StypWriter.Sheet>;
  let producer: Mocked<StyleProducer>;

  beforeEach(() => {
    sheet = {
      addGlobal: jest.fn((name: string, value: string, index?: number) => ({ name, value, index })),
    } as any;
    producer = {
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
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'url(\'http://www.w3.org/1999/xhtml\')', 0);
  });
  it('does not render incompatible default namespace', () => {
    renderer(producer, { '@namespace': 123 });
    expect(sheet.addGlobal).not.toHaveBeenCalled();
  });
  it('renders namespace prefix', () => {
    renderer(producer, { '@namespace:svg': 'http://www.w3.org/2000/svg' });
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'svg url(\'http://www.w3.org/2000/svg\')', 0);
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
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'svg url(\'http://www.w3.org/2000/svg\')', 0);
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'math url(\'http://www.w3.org/1998/Math/MathML\')', 1);
  });
  it('renders namespaces after imports', () => {
    renderer(producer, {
      '@namespace:math': 'http://www.w3.org/1998/Math/MathML',
      '@import:some.css': '',
      '@namespace:svg': 'http://www.w3.org/2000/svg',
    });
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'math url(\'http://www.w3.org/1998/Math/MathML\')', 0);
    expect(sheet.addGlobal).toHaveBeenCalledWith('@import', 'url(\'some.css\')', 0);
    expect(sheet.addGlobal).toHaveBeenCalledWith('@namespace', 'svg url(\'http://www.w3.org/2000/svg\')', 2);
  });
});
