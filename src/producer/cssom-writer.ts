/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { StypPriority } from '../value';
import { StyleProducer } from './style-producer';
import { StypWriter } from './writer';

/**
 * @internal
 */
class CSSOMStyleWriter implements StypWriter.Style {

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
class CSSOMGroupWriter implements StypWriter.Group {

  constructor(readonly _target: CSSStyleSheet | CSSGroupingRule) {
  }

  get isGroup(): true {
    return true;
  }

  addGroup(name: string, params?: string, index?: number): StypWriter.Group {
    return new CSSOMGroupWriter(
        this._add(
            params ? `${name} ${params}{}` : `${name}{}`,
            index,
        ) as CSSGroupingRule,
    );
  }

  addStyle(selector: string, index?: number): StypWriter.Style {
    return new CSSOMStyleWriter(this._add(`${selector}{}`, index) as CSSStyleRule);
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
class CSSOMSheetWriter extends CSSOMGroupWriter implements StypWriter.Sheet {

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

}

/**
 * Builds CSS style sheet writer factory utilizing CSSOM.
 *
 * The result of this function call can be passed as {@link StypOptions.addSheet} option.
 *
 * The sheet writer creates a `<style>` element inside the `parent` node per CSS rule.
 *
 * @category Rendering
 * @param parent  Parent DOM node to add stylesheets to. `document.head` by default
 *
 * @returns  A function returning {@link StypWriter.Sheet style sheet writer} accepting a {@link StyleProducer}
 * as its only parameter.
 */
export function stypCSSOMWriter(
    parent: Node & ParentNode = document.head,
): (this: void, producer: StyleProducer) => StypWriter.Sheet {
  return () => {

    const element = document.createElement('style');

    element.setAttribute('type', 'text/css');
    element.append(document.createTextNode(''));

    parent.appendChild(element);

    return new CSSOMSheetWriter(element);
  };
}
