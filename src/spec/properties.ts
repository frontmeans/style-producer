import { afterEventFrom, EventKeeper } from 'fun-events';
import { StypProperties, StypRule } from '../rule';

export async function readProperties(keeper: EventKeeper<[StypProperties]>): Promise<StypProperties> {
  return new Promise(resolve => afterEventFrom(keeper).once(resolve));
}

export function ruleProperties(rule: StypRule): Promise<StypProperties> {
  return new Promise(resolve => rule.read.once(resolve));
}
