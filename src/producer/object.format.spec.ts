import { noop } from '@proc7ts/call-thru';
import { immediateRenderScheduler } from '@proc7ts/render-scheduler';
import { stypRoot, StypRule } from '../rule';
import { removeStyleElements } from '../spec';
import { stypObjectFormat } from './object.format';
import { produceBasicStyle } from './produce-basic-style';

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
});
