import { overEntries } from '@proc7ts/push-iterator';
import { StypProperties } from '../../rule';
import { stypSplitPriority, StypURL, StypValue } from '../../value';
import { StypRenderer } from '../renderer';
import { StyleProducer } from '../style-producer';
import { StypWriter } from '../writer';
import { stypRenderAtRules } from './at-rules.renderer';
import { FIRST_RENDER_ORDER } from './renderer.impl';

/**
 * CSS stylesheet renderer of global at-rules.
 *
 * It renders at-rules that should stay at the top level:
 * - `@namespace`
 * - `@import`
 *
 * At-rule parameters are taken from root CSS rule properties and treated as following.
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
 * Enabled by default in {@link produceStyle} function.
 *
 * @category Rendering
 */
export const stypRenderGlobals: StypRenderer = {
  order: FIRST_RENDER_ORDER + 1,

  needs: stypRenderAtRules,

  render(producer: StyleProducer, properties: StypProperties) {
    const rootRule = !producer.rule.selector.length;

    const { sheet } = producer;
    let importIndex = 0;
    let nsIndex = 0;

    for (const [k, v] of overEntries(properties)) {
      const key = String(k);

      if (key[0] === '@') {
        const [value] = stypSplitPriority(v);
        const importDelta = rootRule ? renderImport(sheet, importIndex, key, value) : 0;

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

/**
 * @internal
 */
const IMPORT_PREFIX = '@import:';

/**
 * @internal
 */
function renderImport(
  sheet: StypWriter.Sheet,
  index: number,
  key: string,
  value: StypValue,
): number {
  if (!key.startsWith(IMPORT_PREFIX)) {
    return 0;
  }

  const url = new StypURL(key.substring(IMPORT_PREFIX.length));
  let css = String(url);

  if (value) {
    css += ` ${value}`;
  }

  sheet.addGlobal('@import', css, index);

  return 1;
}

/**
 * @internal
 */
function renderDefaultNamespace(
  sheet: StypWriter.Sheet,
  index: number,
  key: string,
  url: StypURL,
): number {
  if (key !== '@namespace') {
    return 0;
  }

  sheet.addGlobal('@namespace', String(url), index);

  return 1;
}

/**
 * @internal
 */
const NS_PREFIX = '@namespace:';

/**
 * @internal
 */
function renderNamespacePrefix(
  sheet: StypWriter.Sheet,
  index: number,
  key: string,
  url: StypURL,
): number {
  if (!key.startsWith(NS_PREFIX)) {
    return 0;
  }

  const prefix = key.substring(NS_PREFIX.length);

  sheet.addGlobal('@namespace', `${prefix} ${url}`, index);

  return 1;
}
