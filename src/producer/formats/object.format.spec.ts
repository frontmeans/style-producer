import { noop } from '@proc7ts/call-thru';
import { immediateRenderScheduler } from '@proc7ts/render-scheduler';
import { stypRoot, StypRule } from '../../rule';
import { removeStyleElements } from '../../spec';
import { produceBasicStyle } from '../produce-basic-style';
import { produceStyle } from '../produce-style';
import { stypObjectFormat } from './object.format';

describe('stypObjectFormat', () => {

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot({ display: 'block' });
  });

  afterEach(() => {
    removeStyleElements();
  });

  it('supplies `document.head` as `node` to scheduler', () => {

    const scheduler = jest.fn(() => noop);

    produceBasicStyle(
        root.rules,
        stypObjectFormat({ scheduler }),
    );
    expect(scheduler).toHaveBeenCalledWith({ node: document.head });
  });
  it('supplies the given `parent` as `node` to scheduler', () => {

    const parent = document.createElement('div');
    const scheduler = jest.fn(() => noop);

    produceBasicStyle(
        root.rules,
        stypObjectFormat({ parent, scheduler }),
    );
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
  it('renders at-rule', () => {

    // Media rules are not fully implemented in CSSOM
    const setProperty = jest.fn();

    CSSMediaRule.prototype.insertRule = function (this: any) {
      this.cssRules = [{ style: { setProperty } }];
      return 0;
    };
    root.rules.add({ c: 'screen-only', $: '@media=screen' }, { display: 'block' });
    produceStyle(root.rules, stypObjectFormat({ scheduler: immediateRenderScheduler }));

    expect(setProperty).toHaveBeenCalledWith('display', 'block', null);
  });
});
