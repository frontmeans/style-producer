import { itsEmpty } from 'a-iterable';
import { noop } from 'call-thru';
import { afterNever, trackValue } from 'fun-events';
import { NamespaceDef } from 'namespace-aliaser';
import { immediateRenderScheduler, newManualRenderScheduler, RenderShot } from 'render-scheduler';
import { StypProperties, stypRoot, StypRule } from '../rule';
import { stypSelector } from '../selector';
import { cssStyle, cssStyles, removeStyleElements, stylesheets } from '../spec';
import { StypLength } from '../value/unit';
import { produceBasicStyle } from './produce-basic-style';
import { StypRender } from './render';
import { StyleProducer } from './style-producer';
import Mock = jest.Mock;
import SpyInstance = jest.SpyInstance;

describe('produceBasicStyle', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  afterEach(() => {
    removeStyleElements();
  });

  describe('document', () => {
    it('is current one by default', () => {

      const mockRender = jest.fn();

      produceBasicStyle(
          root.rules,
          {
            render: mockRender,
            scheduler: immediateRenderScheduler,
          },
      );

      expect(mockRender).toHaveBeenCalledWith(
          expect.objectContaining({ document }),
          expect.anything(),
      );
    });
  });

  describe('parent', () => {
    it('is document head by default', () => {

      const mockRender = jest.fn();

      produceBasicStyle(
          root.rules,
          {
            render: mockRender,
            scheduler: immediateRenderScheduler,
          },
      );

      expect(mockRender).toHaveBeenCalledWith(
          expect.objectContaining({ parent: document.head }),
          expect.anything(),
      );
    });
  });

  describe('nsAlias', () => {
    it('is `nsAlias` option', () => {

      const mockNsAlias = jest.fn();
      let producer: StyleProducer = null!;

      produceBasicStyle(
          root.rules,
          {
            nsAlias: mockNsAlias,
            scheduler: immediateRenderScheduler,
            render(_producer) {
              producer = _producer;
            },
          },
      );

      const ns = new NamespaceDef('test/ns');

      producer.nsAlias(ns);
      expect(mockNsAlias).toHaveBeenCalledWith(ns);
    });
  });

  describe('addStyleSheet option', () => {
    it('is used for CSS  stylesheet creation', () => {

      const mockAddStyleSheet = jest.fn((producer: StyleProducer) => {

        const { document, parent } = producer;
        const element = document.createElement('style');

        element.setAttribute('type', 'text/css');
        element.append(document.createTextNode(''));

        parent.append(element);

        return {
          styleSheet: element.sheet as CSSStyleSheet,
          remove() {
            element.remove();
          },
        };
      });

      produceBasicStyle(
          root.rules,
          {
            scheduler: immediateRenderScheduler,
            addStyleSheet: mockAddStyleSheet,
          },
      );

      expect(mockAddStyleSheet).toHaveBeenCalled();
    });
  });

  describe('render', () => {

    let mockRender1: Mock<void, Parameters<StypRender.Function>>;
    let mockRender2: Mock<void, Parameters<StypRender.Function>>;

    beforeEach(() => {
      mockRender1 = jest.fn();
      mockRender2 = jest.fn();
    });

    it('passes properties to next render', () => {

      const properties: StypProperties = { $name: 'next' };
      let producer: StyleProducer = null!;

      mockRender1.mockImplementation(_producer => {
        producer = _producer;
        _producer.render(properties);
      });

      testProduceStyle();
      expect(mockRender1).toHaveBeenCalledWith(producer, {});
      expect(mockRender2).toHaveBeenCalledWith(producer, properties);
    });
    it('passes selector to next render', () => {

      const selector = stypSelector('test');
      let properties: StypProperties = {};
      let producer: StyleProducer = null!;

      mockRender1.mockImplementation((_producer, _properties) => {
        producer = _producer;
        _producer.render(properties = _properties, { selector });
      });

      testProduceStyle();
      expect(mockRender1).toHaveBeenCalledWith(producer, {});
      expect(mockRender2).toHaveBeenCalledWith(
          expect.objectContaining({ selector, target: producer.target }),
          properties,
      );
    });
    it('passes target to next render', () => {

      const target: CSSStyleSheet = { name: 'stylesheet' } as any;
      let properties: StypProperties = {};
      let producer: StyleProducer = null!;

      mockRender1.mockImplementation((_producer, _properties) => {
        producer = _producer;
        _producer.render(properties = _properties, { target });
      });

      testProduceStyle();
      expect(mockRender1).toHaveBeenCalledWith(producer, {});
      expect(mockRender2).toHaveBeenCalledWith(
          expect.objectContaining({ selector: producer.selector, target }),
          properties,
      );
    });
    it('fulfills render requirements', () => {

      const properties: StypProperties = { $name: 'next' };
      let producer: StyleProducer = null!;

      mockRender1.mockImplementation(_producer => {
        producer = _producer;
        _producer.render(properties);
      });

      produceBasicStyle(
          root.rules,
          {
            render: { order: -1, render: mockRender1, needs: mockRender2 },
            scheduler: immediateRenderScheduler,
          },
      );
      expect(mockRender1).toHaveBeenCalledWith(producer, {});
      expect(mockRender2).toHaveBeenCalledWith(producer, properties);
    });
    it('handles cyclic render requirements', () => {

      const properties: StypProperties = { $name: 'next' };
      let producer: StyleProducer = null!;

      mockRender1.mockImplementation(_producer => {
        producer = _producer;
        _producer.render(properties);
      });

      const render1 = { order: -1, render: mockRender1, needs: [] as StypRender[] };
      const render2 = { order: 0, render: mockRender2, needs: render1 };

      render1.needs.push(render2);

      produceBasicStyle(
          root.rules,
          {
            render: [
              render1,
              render2,
            ],
            scheduler: immediateRenderScheduler,
          },
      );
      expect(mockRender1).toHaveBeenCalledWith(producer, {});
      expect(mockRender1).toHaveBeenCalledTimes(1);
      expect(mockRender2).toHaveBeenCalledWith(producer, properties);
      expect(mockRender2).toHaveBeenCalledTimes(1);
    });
    it('handles premature rule removal', () => {

      const scheduler = newManualRenderScheduler();

      produceBasicStyle(root.rules, {
        render: {
          create(): StypRender.Spec {
            return {
              render: mockRender1,
              read() {
                return afterNever;
              },
            };
          },
        },
        scheduler,
      });

      scheduler.render();
      expect(mockRender1).not.toHaveBeenCalled();
    });

    function testProduceStyle(): void {
      produceBasicStyle(root.rules, { render: [mockRender1, mockRender2], scheduler: immediateRenderScheduler });
    }
  });

  describe('default scheduler', () => {

    let rafSpy: SpyInstance<number, [FrameRequestCallback]>;
    let operations: ((time: number) => void)[];

    beforeEach(() => {
      operations = [];
      rafSpy = jest.spyOn(window, 'requestAnimationFrame');
      rafSpy.mockImplementation(callback => {
        operations.push(callback);
        return 0;
      });
    });
    afterEach(() => {
      operations.forEach(o => o(0)); // Actually perform operations.
    });

    it('schedules in animation frame', () => {
      produceBasicStyle(root.rules);
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
    it('schedules in current window animation frame for detached document', () => {

      const doc = document.implementation.createHTMLDocument();

      produceBasicStyle(root.rules, { document: doc, render: noop });
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
  });

  it('renders body rule by default', () => {
    root.add({ background: 'white' });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });
    expect(cssStyle('body').background).toBe('white');
  });
  it('renders top-level rule', () => {
    root.add({ background: 'white' });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler, rootSelector: '.root' });
    expect(cssStyle('.root').background).toBe('white');
  });
  it('renders root-combined rule', () => {
    root.rules.add(['>', { c: 'nested' }], { background: 'white' });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler, rootSelector: '.root' });
    expect(cssStyle('.root>.nested').background).toBe('white');
  });
  it('renders rule', () => {
    root.rules.add({ c: 'custom' }, { display: 'block' });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });
    expect(cssStyle('.custom').display).toBe('block');
  });
  it('renders prefixed properties', () => {
    root.rules.add({ c: 'custom' }, { MsCustom: 'ms', MozCustom: 'moz' });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('-ms-custom')).toBe('ms');
    expect(style.getPropertyValue('-moz-custom')).toBe('moz');
  });
  it('does not render custom properties', () => {
    root.rules.add({ c: 'custom' }, { _custom: 'abstract-value.ts' });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('_custom')).toBe('');
  });
  it('renders important properties', () => {
    root.rules.add({ c: 'custom' }, { fontSize: '12px !important' });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('important');
  });
  it('renders prioritized properties', () => {
    root.rules.add({ c: 'custom' }, { fontSize: StypLength.of(12, 'px').prioritize(0.5) });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('');
  });
  it('renders prioritized important properties', () => {
    root.rules.add({ c: 'custom' }, { fontSize: StypLength.of(12, 'px').prioritize(1.5) });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('important');
  });
  it('does not render undefined properties', () => {
    root.rules.add({ c: 'custom' }, { display: 'block', fontSize: undefined });
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });
    expect(cssStyle('.custom').fontSize).toBeUndefined();
  });
  it('appends rules', () => {
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });
    root.rules.add({ c: 'custom1' }, { display: 'block' });
    root.rules.add({ c: 'custom2' }, { display: 'inline-block' });
    expect(cssStyle('.custom1').display).toBe('block');
    expect(cssStyle('.custom2').display).toBe('inline-block');
  });
  it('updates rule', () => {

    const properties = trackValue<StypProperties>({ display: 'block' });

    root.rules.add({ c: 'custom' }, properties);
    produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });
    properties.it = { display: 'inline-block' };

    expect(cssStyle('.custom').display).toBe('inline-block');
  });
  it('removes rule', () => {

    const rule = root.rules.add({ c: 'custom' }, { display: 'block' });
    const supply = produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });
    const onDone = jest.fn();

    supply.whenOff(onDone);
    rule.remove();

    expect(onDone).not.toHaveBeenCalled();
    expect(itsEmpty(cssStyles('.custom'))).toBe(true);
  });
  it('does not re-renders too often', () => {

    const operations: RenderShot[] = [];
    const mockScheduler = jest.fn<void, [RenderShot]>();

    mockScheduler.mockImplementation(operation => operations.push(operation));

    const mockRender = jest.fn();
    const scheduler = newManualRenderScheduler();
    const schedule = scheduler();
    const properties = trackValue<StypProperties>({ display: 'block' });
    const rule = root.rules.add({ c: 'custom' }, properties);

    produceBasicStyle(
        rule.rules,
        {
          scheduler: () => jest.fn(render => {
            operations.push(render);
            schedule(render);
          }),
          render: mockRender,
        },
    );
    properties.it = { display: 'inline-block' };

    expect(operations).toHaveLength(2);
    scheduler.render();
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
  it('removes styles when updates supply is cut off', () => {

    const properties = trackValue<StypProperties>({ display: 'block' });

    root.rules.add({ c: 'custom1' }, properties);

    const supply = produceBasicStyle(root.rules, { scheduler: immediateRenderScheduler });

    root.rules.add({ c: 'custom2' }, { width: '100%' });
    supply.off();
    properties.it = { display: 'inline-block' };
    expect(itsEmpty(stylesheets())).toBe(true);
  });
});
