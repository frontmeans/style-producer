import { AfterEvent } from 'fun-events';
import { StypProperties, StypRule } from '../rule';

export async function readProperties(keeper: AfterEvent<[StypProperties]>): Promise<StypProperties> {
  return new Promise(resolve => keeper(resolve));
}

export function ruleProperties(rule: StypRule): Promise<StypProperties> {
  return new Promise(resolve => rule.read(resolve));
}
