import { StypProperties, stypRoot, StypRule } from '../rule';
import { produceBasicStyle } from './produce-basic-style';
import { AIterable, itsEmpty, overArray } from 'a-iterable';
import { trackValue } from 'fun-events';
import { cssStyle, cssStyles, scheduleNow } from '../spec';
import SpyInstance = jest.SpyInstance;

describe('produceBasicStyle', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  afterEach(() => {
    // Remove `<style>` elements
    AIterable.from(overArray(document.head.querySelectorAll('style'))).forEach(e => e.remove());
  });

  describe('document', () => {
    it('is current one by default', () => {

      const mockRender = jest.fn();

      produceBasicStyle(
          root.rules,
          {
            render: mockRender,
            schedule: scheduleNow,
          });

      expect(mockRender).toHaveBeenCalledWith(
          expect.objectContaining({ document }),
          expect.anything());
    });
  });

  describe('parent', () => {
    it('is document head by default', () => {

      const mockRender = jest.fn();

      produceBasicStyle(
          root.rules,
          {
            render: mockRender,
            schedule: scheduleNow,
          });

      expect(mockRender).toHaveBeenCalledWith(
          expect.objectContaining({ parent: document.head }),
          expect.anything());
    });
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
      produceBasicStyle(root.rules);
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
    it('schedules in current window animation frame for detached document', () => {

      const doc = document.implementation.createHTMLDocument();

      produceBasicStyle(root.rules, { document: doc });
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
  });

  it('renders body rule by default', () => {
    root.add({ background: 'white' });
    produceBasicStyle(root.rules, { schedule: scheduleNow });
    expect(cssStyle('body').background).toBe('white');
  });
  it('renders top-level rule', () => {
    root.add({ background: 'white' });
    produceBasicStyle(root.rules, { schedule: scheduleNow, rootSelector: '.root' });
    expect(cssStyle('.root').background).toBe('white');
  });
  it('renders rule', () => {
    root.addRule({ c: 'custom' }, { display: 'block' });
    produceBasicStyle(root.rules, { schedule: scheduleNow });
    expect(cssStyle('.custom').display).toBe('block');
  });
  it('renders important properties', () => {
    root.addRule({ c: 'custom' }, { fontSize: '12px !important' });
    produceBasicStyle(root.rules, { schedule: scheduleNow });

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('important');
  });
  it('appends rule', () => {
    produceBasicStyle(root.rules, { schedule: scheduleNow });
    root.addRule({ c: 'custom' }, { display: 'block' });
    expect(cssStyle('.custom').display).toBe('block');
  });
  it('updates rule', () => {

    const properties = trackValue<StypProperties>({ display: 'block' });

    root.addRule({ c: 'custom' }, properties);
    produceBasicStyle(root.rules, { schedule: scheduleNow });
    properties.it = { display: 'inline-block' };

    expect(cssStyle('.custom').display).toBe('inline-block');
  });
  it('removes rule', () => {

    const rule = root.addRule({ c: 'custom' }, { display: 'block' });
    const interest = produceBasicStyle(root.rules, { schedule: scheduleNow });
    const onDone = jest.fn();

    interest.whenDone(onDone);
    rule.remove();

    expect(onDone).not.toHaveBeenCalled();
    expect(itsEmpty(cssStyles('.custom'))).toBe(true);
  });
  it('does not re-renders too often', () => {

    const operations: (() => void)[] = [];
    const mockScheduler = jest.fn<void, [() => void]>();

    mockScheduler.mockImplementation(operation => operations.push(operation));

    const mockRender = jest.fn();
    const properties = trackValue<StypProperties>({ display: 'block' });
    const rule = root.addRule({ c: 'custom' }, properties);

    produceBasicStyle(rule.rules, { schedule: mockScheduler, render: mockRender });
    properties.it = { display: 'inline-block' };

    expect(operations).toHaveLength(2);

    operations.forEach(operation => operation());
    expect(mockRender).toHaveBeenCalledTimes(1);
  });
  it('removes styles when updates interest is lost', () => {

    const properties = trackValue<StypProperties>({ display: 'block' });

    root.addRule({ c: 'custom' }, properties);
    produceBasicStyle(root.rules, { schedule: scheduleNow }).off();

    properties.it = { display: 'inline-block' };
    expect(itsEmpty(cssStyles())).toBe(true);
  });
});
