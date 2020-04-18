import { StypPriority } from '../value';
import { StyleProducer } from './style-producer';
import { StypWriter } from './writer';

class StypGroupWriter implements StypWriter.Group {

  constructor(readonly _target: CSSStyleSheet | CSSGroupingRule) {
  }

  get isGroup(): true {
    return true;
  }

  addGroup(name: string, params?: string, index?: number): StypWriter.Group {
    return new StypGroupWriter(
        this._add(
            params ? `${name} ${params}{}` : `${name}{}`,
            index,
        ) as CSSGroupingRule,
    );
  }

  addStyle(selector: string, index?: number): StypWriter.Style {
    return new StypStyleWriter(this._add(`${selector}{}`, index) as CSSStyleRule);
  }

  protected _add(
      ruleText: string,
      index = this._target.cssRules.length,
  ): CSSRule {

    const idx = this._target.insertRule(ruleText, index);

    return this._target.cssRules[idx];
  }

}

class StypStyleWriter implements StypWriter.Style {

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
class StypSheetWriter extends StypGroupWriter implements StypWriter.Sheet {

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
 * @internal
 */
export function addStyleElementSheet(producer: StyleProducer): StypWriter.Sheet {

  const { document, parent } = producer;
  const element = document.createElement('style');

  element.setAttribute('type', 'text/css');
  element.append(document.createTextNode(''));

  parent.appendChild(element);

  return new StypSheetWriter(element);
}
