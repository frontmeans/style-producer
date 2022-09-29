import {
  immediateRenderScheduler,
  newManualRenderScheduler,
  noopRenderScheduler,
} from '@frontmeans/render-scheduler';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { itsEmpty } from '@proc7ts/push-iterator';
import { Supply } from '@proc7ts/supply';
import { Mock } from 'jest-mock';
import { stypRoot, StypRule } from '../../rule';
import { cssStyle, removeStyleElements, stylesheets } from '../../spec';
import { produceBasicStyle } from '../produce-basic-style';
import { produceStyle } from '../produce-style';
import { stypDomFormat } from './dom.format';

describe('stypObjectFormat', () => {
  let root: StypRule;
  let done: Supply;

  beforeEach(() => {
    root = stypRoot();
    done = new Supply();
  });
  afterEach(() => {
    done.off();
    removeStyleElements();
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

    it('schedules in animation frame', () => {
      produceStyle(root.rules, stypDomFormat());
      expect(rafSpy).toHaveBeenCalledWith(operations[0]);
    });
  });

  it('supplies `document.head` as `node` to scheduler', () => {
    const scheduler = jest.fn(noopRenderScheduler);

    produceBasicStyle(root.rules, stypDomFormat({ scheduler })).needs(done);
    expect(scheduler).toHaveBeenCalledWith({ node: document.head });
  });
  it("supplies the given document's head as `node` to scheduler", () => {
    root.set({ fontFace: 'Arial, sans-serif' });

    const doc = document.implementation.createHTMLDocument('test');
    const scheduler = jest.fn(noopRenderScheduler);

    produceBasicStyle(root.rules, stypDomFormat({ document: doc, scheduler })).needs(done);
    expect(scheduler).toHaveBeenCalledWith({ node: doc.head });
  });
  it('supplies the given `parent` as `node` to scheduler', () => {
    const parent = document.createElement('div');
    const scheduler = jest.fn(noopRenderScheduler);

    produceBasicStyle(root.rules, stypDomFormat({ parent, scheduler })).needs(done);
    expect(scheduler).toHaveBeenCalledWith({ node: parent });
  });
  it('renders style', () => {
    root.rules.add({ c: 'test' }, { color: 'black' });

    produceBasicStyle(
      root.rules,
      stypDomFormat({
        scheduler: immediateRenderScheduler,
      }),
    ).needs(done);

    expect(cssStyle('.test').getPropertyValue('color')).toBe('black');
    expect(document.head.querySelectorAll('style')[1].textContent).toBe(
      '.test {\n' + '  color: black;\n' + '}',
    );
  });
  it('renders style in disconnected element', () => {
    const parent = document.createDocumentFragment();

    root.rules.add({ c: 'test' }, { color: 'black' });

    produceBasicStyle(
      root.rules,
      stypDomFormat({
        parent,
        scheduler: immediateRenderScheduler,
      }),
    ).needs(done);
    expect(itsEmpty(stylesheets())).toBe(true);

    document.head.appendChild(parent);
    expect(cssStyle('.test').getPropertyValue('color')).toBe('black');
    expect(document.head.querySelectorAll('style')[1].textContent).toBe(
      '.test {\n' + '  color: black;\n' + '}',
    );
  });
  it('updates style when rule updated', () => {
    const rule = root.rules.add({ c: 'test' }, { color: 'black' });

    produceBasicStyle(
      root.rules,
      stypDomFormat({
        scheduler: immediateRenderScheduler,
      }),
    ).needs(done);

    rule.set({ color: 'red' });

    expect(document.head.querySelectorAll('style')[1].textContent).toBe(
      '.test {\n' + '  color: red;\n' + '}',
    );
    expect(cssStyle('.test').getPropertyValue('color')).toBe('red');
  });
  it('removes style when rule removed', () => {
    const rule = root.rules.add({ c: 'test' }, { color: 'black' });

    produceBasicStyle(
      root.rules,
      stypDomFormat({
        scheduler: immediateRenderScheduler,
      }),
    ).needs(done);

    rule.remove();

    expect(document.head.querySelectorAll('style')).toHaveLength(1);
  });
  it('does not add style when rule removed before rendered', () => {
    const scheduler = newManualRenderScheduler();
    const rule = root.rules.add({ c: 'test' }, { color: 'black' });

    produceBasicStyle(root.rules, stypDomFormat({ scheduler })).needs(done);

    rule.remove();
    scheduler.render();

    expect(document.head.querySelectorAll('style')).toHaveLength(1);

    done.off();
    scheduler.render();
  });
  it('removes all styles when their supply is cut off', () => {
    root.rules.add({ c: 'test' }, { color: 'black' });

    produceBasicStyle(
      root.rules,
      stypDomFormat({
        scheduler: immediateRenderScheduler,
      }),
    ).needs(done);

    done.off();
    expect(document.head.querySelectorAll('style')).toHaveLength(0);
  });
});
