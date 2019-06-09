import { stypSplitPriority, StypValue } from '../value';

export function textAndPriority(value: StypValue): [string, number] {

  const [v, p] = stypSplitPriority(value);

  return [`${v}`, p];
}
