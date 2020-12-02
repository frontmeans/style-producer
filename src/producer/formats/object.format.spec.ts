import { immediateRenderScheduler, RenderScheduler } from '@frontmeans/render-scheduler';
import { EventSupply, eventSupply } from '@proc7ts/fun-events';
import { noop } from '@proc7ts/primitives';
import { itsFirst } from '@proc7ts/push-iterator';
import { stypRoot, StypRule } from '../../rule';
import { stylesheets } from '../../spec';
import { produceBasicStyle } from '../produce-basic-style';
import { produceStyle } from '../produce-style';
import { stypObjectFormat } from './object.format';

describe('stypObjectFormat', () => {

  let root: StypRule;
  let done: EventSupply;

  beforeEach(() => {
    root = stypRoot({ fontFace: 'Arial, sans-serif' });
    done = eventSupply();
  });
  afterEach(() => {
    done.off();
  });

  describe('scheduler', () => {

    let rafSpy: jest.SpyInstance<number, [FrameRequestCallback]>;
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
      produceStyle(root.rules, stypObjectFormat());
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
  });

  it('supplies `document.head` as `node` to scheduler', () => {

    const scheduler = jest.fn<ReturnType<RenderScheduler>, Parameters<RenderScheduler>>(() => noop);

    produceBasicStyle(
        root.rules,
        stypObjectFormat({ scheduler }),
    ).needs(done);
    expect(scheduler).toHaveBeenCalledWith({ node: document.head });
  });
  it('supplies the given `parent` as `node` to scheduler', () => {

    const parent = document.createElement('div');
    const scheduler = jest.fn<ReturnType<RenderScheduler>, Parameters<RenderScheduler>>(() => noop);

    produceBasicStyle(
        root.rules,
        stypObjectFormat({ parent, scheduler }),
    ).needs(done);
    expect(scheduler).toHaveBeenCalledWith({ node: parent });
  });
  it('supplies `error` option', () => {

    const scheduler = jest.fn(immediateRenderScheduler);
    const format = stypObjectFormat({ scheduler });

    const scheduleOpts = { error: jest.fn() };
    const schedule = format.scheduler!(scheduleOpts);
    const error = new Error('test');

    schedule(() => { throw error; });

    expect(scheduleOpts.error).toHaveBeenCalledWith(error);
    expect(scheduleOpts.error.mock.instances[0]).toBe(scheduleOpts);
  });
  it('renders global at-rule', () => {
    root.set({ '@import:some.css': '', '@import:screen.css': 'screen' });
    produceStyle(root.rules, stypObjectFormat({ scheduler: immediateRenderScheduler })).needs(done);

    const sheet = itsFirst(stylesheets())!;

    expect(sheet.cssRules[0].type).toBe(CSSRule.IMPORT_RULE);

    const rule0 = sheet.cssRules[0] as CSSImportRule;

    expect(rule0.href).toBe('some.css');
    expect(rule0.media).toHaveLength(0);

    const rule1 = sheet.cssRules[1] as CSSImportRule;

    expect(rule1.href).toBe('screen.css');
    expect(rule1.media.mediaText).toBe('screen');
  });
  it('renders at-rule', () => {

    // Media rules are not fully implemented in CSSOM
    const setProperty = jest.fn();

    CSSMediaRule.prototype.insertRule = function (this: any) {
      this.cssRules = [{ style: { setProperty } }];
      return 0;
    };
    root.rules.add({ c: 'screen-only', $: '@media=screen' }, { display: 'block' });
    produceStyle(root.rules, stypObjectFormat({ scheduler: immediateRenderScheduler })).needs(done);

    expect(setProperty).toHaveBeenCalledWith('display', 'block', undefined);
  });
});
