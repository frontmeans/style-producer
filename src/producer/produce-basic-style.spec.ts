import { doqryPicker } from '@frontmeans/doqry';
import { NamespaceDef, newNamespaceAliaser } from '@frontmeans/namespace-aliaser';
import {
  immediateRenderScheduler,
  newManualRenderScheduler,
  noopRenderScheduler,
  RenderShot,
  setRenderScheduler,
} from '@frontmeans/render-scheduler';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { afterNever, trackValue } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { itsEmpty } from '@proc7ts/push-iterator';
import { Mock } from 'jest-mock';
import { StypProperties, stypRoot, StypRule } from '../rule';
import { cssStyle, cssStyles, removeStyleElements, stylesheets } from '../spec';
import { StypLength } from '../value';
import { stypObjectFormat } from './formats';
import { produceBasicStyle } from './produce-basic-style';
import { StypRenderer } from './renderer';
import { StyleProducer } from './style-producer';
import { StypWriter } from './writer';

describe('produceBasicStyle', () => {
  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  afterEach(() => {
    removeStyleElements();
  });

  describe('nsAlias', () => {
    it('is `nsAlias` option', () => {
      const mockNsAlias = jest.fn(newNamespaceAliaser());
      let producer: StyleProducer = null!;

      produceBasicStyle(
        root.rules,
        stypObjectFormat({
          nsAlias: mockNsAlias,
          scheduler: immediateRenderScheduler,
          renderer(_producer) {
            producer = _producer;
          },
        }),
      );

      const ns = new NamespaceDef('test/ns');

      producer.nsAlias(ns);
      expect(mockNsAlias).toHaveBeenCalledWith(ns);
    });
  });

  describe('addSheet', () => {
    it('is used to write out style sheets', () => {
      const objectWriter = stypObjectFormat();
      const mockAddSheet = jest.fn(objectWriter.addSheet.bind(objectWriter));

      produceBasicStyle(root.rules, {
        scheduler: immediateRenderScheduler,
        addSheet: mockAddSheet,
      });

      expect(mockAddSheet).toHaveBeenCalled();
    });
  });

  describe('renderer', () => {
    let mockRenderer1: Mock<StypRenderer.Function>;
    let mockRenderer2: Mock<StypRenderer.Function>;

    beforeEach(() => {
      mockRenderer1 = jest.fn();
      mockRenderer2 = jest.fn();
    });

    it('passes properties to next renderer', () => {
      const properties: StypProperties = { $name: 'next' };
      let producer: StyleProducer = null!;

      mockRenderer1.mockImplementation(_producer => {
        producer = _producer;
        _producer.render(properties);
      });

      testProduceStyle();
      expect(mockRenderer1).toHaveBeenCalledWith(producer, {});
      expect(mockRenderer2).toHaveBeenCalledWith(producer, properties);
    });
    it('passes selector to next renderer', () => {
      const selector = doqryPicker('test');
      let properties: StypProperties = {};
      let producer: StyleProducer = null!;

      mockRenderer1.mockImplementation((_producer, _properties) => {
        producer = _producer;
        _producer.render((properties = _properties), { selector });
      });

      testProduceStyle();
      expect(mockRenderer1).toHaveBeenCalledWith(producer, {});
      expect(mockRenderer2).toHaveBeenCalledWith(
        expect.objectContaining({ selector, writer: producer.writer }) as unknown as StyleProducer,
        properties,
      );
    });
    it('passes target to next renderer', () => {
      const writer: StypWriter = { name: 'stylesheet writer' } as any;
      let properties: StypProperties = {};
      let producer: StyleProducer = null!;

      mockRenderer1.mockImplementation((_producer, _properties) => {
        producer = _producer;
        _producer.render((properties = _properties), { writer });
      });

      testProduceStyle();
      expect(mockRenderer1).toHaveBeenCalledWith(producer, {});
      expect(mockRenderer2).toHaveBeenCalledWith(
        expect.objectContaining({
          selector: producer.selector,
          writer,
        }) as unknown as StyleProducer,
        properties,
      );
    });
    it('fulfills renderer requirements', () => {
      const properties: StypProperties = { $name: 'next' };
      let producer: StyleProducer = null!;

      mockRenderer1.mockImplementation(_producer => {
        producer = _producer;
        _producer.render(properties);
      });

      produceBasicStyle(
        root.rules,
        stypObjectFormat({
          renderer: { order: -1, render: mockRenderer1, needs: mockRenderer2 },
          scheduler: immediateRenderScheduler,
        }),
      );
      expect(mockRenderer1).toHaveBeenCalledWith(producer, {});
      expect(mockRenderer2).toHaveBeenCalledWith(producer, properties);
    });
    it('handles cyclic renderer requirements', () => {
      const properties: StypProperties = { $name: 'next' };
      let producer: StyleProducer = null!;

      mockRenderer1.mockImplementation(_producer => {
        producer = _producer;
        _producer.render(properties);
      });

      const renderer1 = { order: -1, render: mockRenderer1, needs: [] as StypRenderer[] };
      const render2 = { order: 0, render: mockRenderer2, needs: renderer1 };

      renderer1.needs.push(render2);

      produceBasicStyle(
        root.rules,
        stypObjectFormat({
          renderer: [renderer1, render2],
          scheduler: immediateRenderScheduler,
        }),
      );
      expect(mockRenderer1).toHaveBeenCalledWith(producer, {});
      expect(mockRenderer1).toHaveBeenCalledTimes(1);
      expect(mockRenderer2).toHaveBeenCalledWith(producer, properties);
      expect(mockRenderer2).toHaveBeenCalledTimes(1);
    });
    it('handles premature rule removal', () => {
      const scheduler = newManualRenderScheduler();

      produceBasicStyle(
        root.rules,
        stypObjectFormat({
          renderer: {
            create(): StypRenderer.Spec {
              return {
                render: mockRenderer1,
                read() {
                  return afterNever;
                },
              };
            },
          },
          scheduler,
        }),
      );

      scheduler.render();
      expect(mockRenderer1).not.toHaveBeenCalled();
    });

    function testProduceStyle(): void {
      produceBasicStyle(
        root.rules,
        stypObjectFormat({
          renderer: [mockRenderer1, mockRenderer2],
          scheduler: immediateRenderScheduler,
        }),
      );
    }
  });

  describe('scheduler', () => {
    let rafSpy: Mock<Window['requestAnimationFrame']>;
    let operations: ((time: number) => void)[];

    beforeEach(() => {
      operations = [];
      rafSpy = jest.spyOn(window, 'requestAnimationFrame') as typeof rafSpy;
      rafSpy.mockImplementation(callback => {
        operations.push(callback);

        return 0;
      });
    });
    afterEach(() => {
      operations.forEach(o => o(0)); // Actually perform operations.
    });

    it('schedules in animation frame', () => {
      produceBasicStyle(root.rules, stypObjectFormat());
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
    it('schedules in current window animation frame for detached document', () => {
      produceBasicStyle(root.rules, stypObjectFormat({ renderer: noop }));
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
    it('uses default render scheduler', () => {
      const scheduler = jest.fn(noopRenderScheduler);

      setRenderScheduler(scheduler);
      try {
        produceBasicStyle(root.rules, {
          addSheet() {
            throw new Error('should never be called');
          },
        });
        expect(scheduler).toHaveBeenCalled();
      } finally {
        setRenderScheduler();
      }
    });
  });

  it('renders body rule by default', () => {
    root.add({ background: 'white' });
    produceBasicStyle(root.rules, stypObjectFormat({ scheduler: immediateRenderScheduler }));
    expect(cssStyle('body').background).toBe('white');
  });
  it('renders top-level rule', () => {
    root.add({ background: 'white' });
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
        rootSelector: '.root',
      }),
    );
    expect(cssStyle('.root').background).toBe('white');
  });
  it('renders root-combined rule', () => {
    root.rules.add(['>', { c: 'nested' }], { background: 'white' });
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
        rootSelector: '.root',
      }),
    );
    expect(cssStyle('.root>.nested').background).toBe('white');
  });
  it('renders rule', () => {
    root.rules.add({ c: 'custom' }, { display: 'block' });
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );
    expect(cssStyle('.custom').display).toBe('block');
  });
  it('renders prefixed properties', () => {
    root.rules.add({ c: 'custom' }, { MsCustom: 'ms', MozCustom: 'moz' });
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('-ms-custom')).toBe('ms');
    expect(style.getPropertyValue('-moz-custom')).toBe('moz');
  });
  it('does not render custom properties', () => {
    root.rules.add({ c: 'custom' }, { _custom: 'abstract-value.ts' });
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('_custom')).toBe('');
  });
  it('renders important properties', () => {
    root.rules.add({ c: 'custom' }, { fontSize: '12px !important' });
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('important');
  });
  it('renders prioritized properties', () => {
    root.rules.add(
      { c: 'custom' },
      {
        fontSize: StypLength.of(12, 'px').prioritize(0.5),
      },
    );
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('');
  });
  it('renders prioritized important properties', () => {
    root.rules.add(
      { c: 'custom' },
      {
        fontSize: StypLength.of(12, 'px').prioritize(1.5),
      },
    );
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('important');
  });
  it('does not render undefined properties', () => {
    root.rules.add({ c: 'custom' }, { display: 'block', fontSize: undefined });
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );
    expect(cssStyle('.custom').fontSize).toBeUndefined();
  });
  it('appends rules', () => {
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );
    root.rules.add({ c: 'custom1' }, { display: 'block' });
    root.rules.add({ c: 'custom2' }, { display: 'inline-block' });
    expect(cssStyle('.custom1').display).toBe('block');
    expect(cssStyle('.custom2').display).toBe('inline-block');
  });
  it('updates rule', () => {
    const properties = trackValue<StypProperties>({ display: 'block' });

    root.rules.add({ c: 'custom' }, properties);
    produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );
    properties.it = { display: 'inline-block' };

    expect(cssStyle('.custom').display).toBe('inline-block');
  });
  it('removes rule', () => {
    const rule = root.rules.add({ c: 'custom' }, { display: 'block' });
    const supply = produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );
    const onDone = jest.fn();

    supply.whenOff(onDone);
    rule.remove();

    expect(onDone).not.toHaveBeenCalled();
    expect(itsEmpty(cssStyles('.custom'))).toBe(true);
  });
  it('does not re-render too often', () => {
    const operations: RenderShot[] = [];
    const mockRenderer = jest.fn();
    const scheduler = newManualRenderScheduler();
    const schedule = scheduler();
    const properties = trackValue<StypProperties>({ display: 'block' });
    const rule = root.rules.add({ c: 'custom' }, properties);

    produceBasicStyle(
      rule.rules,
      stypObjectFormat({
        scheduler:
          () => (shot: RenderShot): void => {
            operations.push(shot);
            schedule(shot);
          },
        renderer: mockRenderer,
      }),
    );
    properties.it = { display: 'inline-block' };

    expect(operations).toHaveLength(2);
    scheduler.render();
    expect(mockRenderer).toHaveBeenCalledTimes(1);
  });
  it('removes styles when updates supply is cut off', () => {
    const properties = trackValue<StypProperties>({ display: 'block' });

    root.rules.add({ c: 'custom1' }, properties);

    const supply = produceBasicStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );

    root.rules.add({ c: 'custom2' }, { width: '100%' });
    supply.off();
    properties.it = { display: 'inline-block' };
    expect(itsEmpty(stylesheets())).toBe(true);
  });
});
