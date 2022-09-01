import { isReadonlyArray } from '../../internal';
import { StypRenderer } from '../renderer';
import { stypRenderAtRules } from './at-rules.renderer';
import { stypRenderGlobals } from './globals.renderer';
import { stypRenderText } from './text.renderer';
import { stypRenderXmlNs } from './xml-ns.renderer';

/**
 * @internal
 */
export function defaultStypRenderers(
  renderer: StypRenderer | readonly StypRenderer[] | undefined,
): readonly StypRenderer[] {
  const result: StypRenderer[] = [
    stypRenderAtRules,
    stypRenderXmlNs,
    stypRenderGlobals,
    stypRenderText,
  ];

  if (renderer) {
    if (isReadonlyArray(renderer)) {
      result.push(...renderer);
    } else {
      result.push(renderer);
    }
  }

  return result;
}
