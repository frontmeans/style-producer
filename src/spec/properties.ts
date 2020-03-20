import { afterSupplied, EventKeeper } from '@proc7ts/fun-events';
import { StypProperties, StypRule } from '../rule';

export async function readProperties(keeper: EventKeeper<[StypProperties]>): Promise<StypProperties> {
  return new Promise(resolve => afterSupplied(keeper).once(resolve));
}

export function ruleProperties(rule: StypRule): Promise<StypProperties> {
  return new Promise(resolve => rule.read().once(resolve));
}
