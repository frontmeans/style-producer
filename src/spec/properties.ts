import { StypProperties, StypRule } from '../rule';
import { AfterEvent } from 'fun-events';

export async function readProperties(keeper: AfterEvent<[StypProperties]>): Promise<StypProperties> {
  return new Promise(resolve => keeper(resolve));
}

export function ruleProperties(rule: StypRule): Promise<StypProperties> {
  return new Promise(resolve => rule.read(resolve));
}
