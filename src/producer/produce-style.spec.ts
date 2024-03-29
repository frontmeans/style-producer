import { immediateRenderScheduler } from '@frontmeans/render-scheduler';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { stypRoot, StypRule } from '../rule';
import { cssStyle, removeStyleElements } from '../spec';
import { stypObjectFormat } from './formats';
import { produceStyle } from './produce-style';
import { StypRenderer } from './renderer';

describe('produceStyle', () => {
  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  afterEach(() => {
    removeStyleElements();
  });

  it('uses the given renderer', () => {
    const mockRenderer = jest.fn<StypRenderer.Function>();

    produceStyle(
      root.rules,
      stypObjectFormat({
        renderer: mockRenderer,
        scheduler: immediateRenderScheduler,
      }),
    );
    expect(mockRenderer).toHaveBeenCalled();
  });
  it('uses the given renderer factory', () => {
    const mockRenderer = jest.fn<StypRenderer.Function>();
    const mockCreate = jest.fn<(rule: StypRule) => StypRenderer.Function>(() => mockRenderer);

    produceStyle(
      root.rules,
      stypObjectFormat({
        renderer: { create: mockCreate },
        scheduler: immediateRenderScheduler,
      }),
    );
    expect(mockCreate).toHaveBeenCalledWith(root);
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockRenderer).toHaveBeenCalled();
  });
  it('uses the given renderers', () => {
    const mockRender1 = jest.fn<StypRenderer.Function>((producer, properties) => producer.render(properties));
    const mockRender2 = jest.fn<StypRenderer.Function>();

    produceStyle(
      root.rules,
      stypObjectFormat({
        renderer: [mockRender1, mockRender2],
        scheduler: immediateRenderScheduler,
      }),
    );
    expect(mockRender1).toHaveBeenCalled();
    expect(mockRender2).toHaveBeenCalled();
  });
  it('orders renderers', () => {
    const calls: number[] = [];
    const mockRender1 = jest.fn<StypRenderer.Function>((producer, properties) => {
      calls.push(1);
      producer.render(properties);
    });
    const mockRender2 = jest.fn<StypRenderer.Function>((producer, properties) => {
      calls.push(2);
      producer.render(properties);
    });

    produceStyle(
      root.rules,
      stypObjectFormat({
        renderer: [
          { order: 2, render: mockRender1 },
          { order: 1, render: mockRender2 },
        ],
        scheduler: immediateRenderScheduler,
      }),
    );
    expect(calls).toEqual([2, 1]);
  });
  it('renders raw CSS text', () => {
    root.rules.add({ c: 'custom' }, 'font-size: 12px !important;');
    produceStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('12px');
    expect(style.getPropertyPriority('font-size')).toBe('important');
  });
  it('renders raw CSS text before CSS properties', () => {
    root.rules.add(
      { c: 'custom' },
      { fontSize: '11px', $$css: 'font-weight: bold; font-size: 12px;' },
    );
    produceStyle(
      root.rules,
      stypObjectFormat({
        scheduler: immediateRenderScheduler,
      }),
    );

    const style = cssStyle('.custom');

    expect(style.getPropertyValue('font-size')).toBe('11px');
    expect(style.getPropertyValue('font-weight')).toBe('bold');
  });
});
