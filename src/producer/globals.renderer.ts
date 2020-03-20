/**
 * @packageDocumentation
 * @module @proc7ts/style-producer
 */
import { overEntries } from '@proc7ts/a-iterable';
import { StypProperties } from '../rule';
import { stypSplitPriority, StypURL, StypValue } from '../value';
import { stypRenderAtRules } from './at-rules.renderer';
import { StypRenderer } from './renderer';
import { FIRST_RENDER_ORDER } from './renderer.impl';
import { StyleProducer } from './style-producer';

/**
 * CSS stylesheet renderer of global at-rules.
 *
 * It renders at-rules that should stay at the top level:
 * - `@namespace`
 * - `@import`
 *
 * At-rule parameters are taken from root CSS rule properties and treated as following rules.
 *
 * **`@import:url`** property value is treated as media query and appended after stylesheet URL. I.e.
 * ```json
 * {
 *     "@import:path/to/included.css": "screen"
 * }
 * ```
 * becomes
 * ```css
 * @import url(path/to/included.css) screen;
 * ```
 *
 * **`@namespace`** property value is treated as default namespace URL. I.e.
 * ```json
 * {
 *     "@namespace": "http://www.w3.org/1999/xhtml"
 * }
 * ```
 * becomes
 * ```css
 * @namespace url(http://www.w3.org/1999/xhtml);
 * ```
 *
 * **`@namespace:prefix`** property value is treated as namespace URL with the given prefix. I.e
 * ```json
 * {
 *     "@namespace:svg": "http://www.w3.org/2000/svg"
 * }
 * ```
 * becomes
 * ```css
 * @namespace svg url(http://www.w3.org/2000/svg);
 * ```
 *
 * Enabled by default in [[produceStyle]] function.
 *
 * @category Rendering
 */
export const stypRenderGlobals: StypRenderer = {

  order: FIRST_RENDER_ORDER + 1,

  needs: stypRenderAtRules,

  render(producer: StyleProducer, properties: StypProperties) {

    const sheet = producer.styleSheet;
    let importIndex = 0;
    let nsIndex = 0;

    for (const [k, v] of overEntries(properties)) {

      const key = String(k);

      if (key[0] === '@') {

        const [value] = stypSplitPriority(v);
        const importDelta = renderImport(sheet, importIndex, key, value);

        importIndex += importDelta;
        nsIndex += importDelta;

        const url = StypURL.by(value);

        if (url) {
          nsIndex += renderDefaultNamespace(sheet, nsIndex, key, url);
          nsIndex += renderNamespacePrefix(sheet, nsIndex, key, url);
        }
      }
    }

    producer.render(properties);
  },

};

const IMPORT_PREFIX = '@import:';

function renderImport(
    sheet: CSSStyleSheet,
    index: number,
    key: string,
    value: StypValue,
): number {
  if (!key.startsWith(IMPORT_PREFIX)) {
    return 0;
  }

  const url = new StypURL(key.substring(IMPORT_PREFIX.length));
  let css = `@import ${url}`;

  if (value) {
    css += ' ' + value;
  }

  sheet.insertRule(css + ';', index);

  return 1;
}

function renderDefaultNamespace(
    sheet: CSSStyleSheet,
    index: number,
    key: string,
    url: StypURL,
): number {
  if (key !== '@namespace') {
    return 0;
  }

  sheet.insertRule(`@namespace ${url};`, index);

  return 1;
}

const NS_PREFIX = '@namespace:';

function renderNamespacePrefix(
    sheet: CSSStyleSheet,
    index: number,
    key: string,
    url: StypURL,
): number {
  if (!key.startsWith(NS_PREFIX)) {
    return 0;
  }

  const prefix = key.substring(NS_PREFIX.length);

  sheet.insertRule(`@namespace ${prefix} ${url};`, index);

  return 1;
}
