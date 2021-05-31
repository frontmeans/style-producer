import { doqryDisplayText } from '@frontmeans/doqry';
import { StypRuleKey } from './rule-key';

/**
 * @internal
 */
export function stypRuleKeyText(key: StypRuleKey): string {
  return doqryDisplayText(key);
}
