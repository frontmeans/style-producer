import { DoqryPicker, doqryPicker, DoqryPureSelector, DoqrySelector } from '@frontmeans/doqry';
import { namesEqual, QualifiedName } from '@frontmeans/namespace-aliaser';
import { stypQuery, StypQuery } from './query';

/**
 * Checks whether the given structured CSS `selector` matches target `query`.
 *
 * @category CSS Rule
 * @param selector - Structured CSS selector.
 * @param query - CSS rule query.
 *
 * @returns `true` if `selector` matches the `query`, or `false` otherwise.
 */
export function stypQueryMatch(
  selector: DoqrySelector | DoqryPureSelector,
  query: StypQuery,
): boolean {
  const picker = doqryPicker(selector);

  if (!picker.length) {
    return false;
  }

  const part = picker[picker.length - 1] as DoqryPicker.Part;
  const q = stypQuery(query);

  if (q.ns && part.ns !== q.ns) {
    return false;
  }
  if (q.e && part.e !== q.e) {
    return false;
  }
  if (q.i && part.i !== q.i) {
    return false;
  }
  if (q.c && !StypQuery$classesMatch(part.c, q.c)) {
    return false;
  }
  // noinspection RedundantIfStatementJS
  if (q.$ && !StypQuery$classesMatch(part.$, q.$)) {
    return false;
  }

  return true;
}

function StypQuery$classesMatch(
  classes: readonly QualifiedName[] | undefined,
  query: readonly QualifiedName[],
): boolean | undefined {
  return classes && query.every(qClass => classes.find(mClass => namesEqual(qClass, mClass)));
}
