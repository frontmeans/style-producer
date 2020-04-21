/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { RenderScheduler } from '@proc7ts/render-scheduler';
import { StypPriority } from '../../value';
import { StypFormat, StypFormatConfig } from '../format';
import { StypWriter } from '../writer';
import { stypRenderScheduler } from './format.impl';

/**
 * @internal
 */
class StypStyleObjectWriter implements StypWriter.Style {

  constructor(private readonly _target: CSSStyleRule) {
  }

  get isGroup(): false {
    return false;
  }

  set(name: string, value: string, priority: number): void {
    this._target.style.setProperty(name, value, priority >= StypPriority.Important ? 'important' : null);
  }

  replace(css: string): void {
    this._target.style.cssText = css;
  }

}

/**
 * @internal
 */
class StypGroupObjectWriter implements StypWriter.Group {

  constructor(readonly _target: CSSStyleSheet | CSSGroupingRule) {
  }

  get isGroup(): true {
    return true;
  }

  addGroup(name: string, params: string, index?: number): StypWriter.Group {
    return new StypGroupObjectWriter(
        this._add(
            `${name} ${params}{}`,
            index,
        ) as CSSGroupingRule,
    );
  }

  addStyle(selector: string, index?: number): StypWriter.Style {
    return new StypStyleObjectWriter(this._add(`${selector}{}`, index) as CSSStyleRule);
  }

  protected _add(
      ruleText: string,
      index = this._target.cssRules.length,
  ): CSSRule {

    const idx = this._target.insertRule(ruleText, index);

    return this._target.cssRules[idx];
  }

}

/**
 * @internal
 */
class StypSheetObjectWriter extends StypGroupObjectWriter implements StypWriter.Sheet {

  constructor(private readonly _element: HTMLStyleElement) {
    super(_element.sheet as CSSStyleSheet);
  }

  addGlobal(name: string, value: string, index?: number): void {
    this._add(`${name} ${value};`, index);
  }

  clear(): void {

    const { cssRules } = this._target;

    while (cssRules.length) {
      this._target.deleteRule(cssRules.length - 1);
    }
  }

  remove(): void {
    this._element.parentNode!.removeChild(this._element);
  }

  done(): void {
    /* do nothing */
  }

}

/**
 * Configuration of {@link stypObjectFormat CSS object model production format}.
 *
 * @category Rendering
 */
export interface StypObjectFormatConfig extends StypFormatConfig {

  /**
   * Parent DOM node to add stylesheets to.
   *
   * `document.head` by default.
   *
   * This node has to be attached to document.
   */
  readonly parent?: Node;

  /**
   * DOM rendering operations scheduler.
   *
   * Creates a render schedule per rule.
   *
   * Uses `newRenderSchedule` for [[parent]] node by default.
   */
  readonly scheduler?: RenderScheduler;

}

/**
 * Builds CSS object model production format.
 *
 * The sheet writer creates a `<style>` element inside the `parent` node per CSS rule and builds its style sheet
 * with CSS object model methods.
 *
 * @category Rendering
 * @param config  Object format configuration.
 *
 * @returns CSS production format.
 */
export function stypObjectFormat(
    config: StypObjectFormatConfig = {},
): StypFormat {

  const { parent = document.head } = config;

  return {
    ...config,
    scheduler: stypRenderScheduler(parent, config.scheduler),
    addSheet() {

      const element = document.createElement('style');

      element.setAttribute('type', 'text/css');
      element.append(document.createTextNode(''));

      parent.appendChild(element);

      return new StypSheetObjectWriter(element);
    },
  };
}
