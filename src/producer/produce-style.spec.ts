import { stypRoot, StypRule } from '../rule';
import { cssStyle, removeStyleElements, scheduleNow, stylesheets } from '../spec';
import { produceStyle } from './produce-style';
import { StypRender } from './render';
import SpyInstance = jest.SpyInstance;

describe('produceStyle', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  afterEach(() => {
    removeStyleElements();
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

    it('schedules in animation frame', () => {
      produceStyle(root.rules);
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
  });

  it('uses the given render', () => {

    const mockRender = jest.fn<void, Parameters<StypRender.Function>>();

    produceStyle(root.rules, { render: mockRender, schedule: scheduleNow });
    expect(mockRender).toHaveBeenCalled();
  });
  it('uses the given render factory', () => {

    const mockRender = jest.fn<void, Parameters<StypRender.Function>>();
    const mockCreate = jest.fn<StypRender.Function, [StypRule]>(() => mockRender);

    produceStyle(root.rules, { render: { create: mockCreate }, schedule: scheduleNow });
    expect(mockCreate).toHaveBeenCalledWith(root);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockRender).toHaveBeenCalled();
  });
  it('uses the given renders', () => {

    const mockRender1 = jest.fn<void, Parameters<StypRender.Function>>(
        (producer, properties) => producer.render(properties));
    const mockRender2 = jest.fn<void, Parameters<StypRender.Function>>();

    produceStyle(root.rules, { render: [mockRender1, mockRender2], schedule: scheduleNow });
    expect(mockRender1).toHaveBeenCalled();
    expect(mockRender2).toHaveBeenCalled();
  });
  it('orders renders', () => {

    const calls: number[] = [];
    const mockRender1 = jest.fn<void, Parameters<StypRender.Function>>(
        (producer, properties) => {
          calls.push(1);
          producer.render(properties);
        }
    );
    const mockRender2 = jest.fn<void, Parameters<StypRender.Function>>(
        (producer, properties) => {
          calls.push(2);
          producer.render(properties);
        }
    );

    produceStyle(root.rules, {
      render: [
        { order: 2, render: mockRender1 },
        { order: 1, render: mockRender2 },
      ],
      schedule: scheduleNow });
    expect(calls).toEqual([2, 1]);
  });
  it('renders raw CSS text', () => {
    root.rules.add({ c: 'custom' }, 'font-size: 12px !important;');
    produceStyle(root.rules, { schedule: scheduleNow });

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('important');
  });
  it('renders raw CSS text before CSS properties', () => {
    root.rules.add({ c: 'custom' }, { fontSize: '11px', $$css: 'font-weight: bold; font-size: 12px;' });
    produceStyle(root.rules, { schedule: scheduleNow });

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('11px');
    expect(style.getPropertyValue('font-weight')).toBe('bold');
  });
  it('renders imports', () => {
    root.add({
      '@import:some.css': '',
      '@import:other.css': 'screen',
    });
    root.rules.add({ c: 'custom' });
    produceStyle(root.rules, { schedule: scheduleNow });

    stylesheets().forEach(sheet => {
      expect(sheet.cssRules[0].type).toBe(CSSRule.IMPORT_RULE);
      expect(sheet.cssRules[1].type).toBe(CSSRule.IMPORT_RULE);

      const rule0 = sheet.cssRules[0] as CSSImportRule;

      expect(rule0.href).toBe('some.css');
      expect(rule0.media).toHaveLength(0);

      const rule1 = sheet.cssRules[1] as CSSImportRule;

      expect(rule1.href).toBe('other.css');
      expect(rule1.media.mediaText).toBe('screen');
    });
  });
});