import { filterIt, itsIterable } from 'a-iterable';
import { asis, valueProvider } from 'call-thru';
import { AfterEvent, afterEventFrom, OnEvent, OnEvent__symbol, onEventBy, onEventFrom, onNever } from 'fun-events';
import { stypQuery, StypQuery, stypSelectorMatches } from '../selector';
import { StypRule, StypRuleList } from './rule';
import { StypRules } from './rules';

/**
 * @internal
 */
export class Rules extends StypRuleList {

  readonly onUpdate: OnEvent<[StypRule[], StypRule[]]>;
  readonly read: AfterEvent<[Rules]>;
  readonly [Symbol.iterator]: () => IterableIterator<StypRule>;

  constructor(list: StypRules, ruleMatches?: (rule: StypRule) => boolean) {
    super();

    let buildList: () => Iterable<StypRule>;
    let filterArray: (rules: StypRule[]) => StypRule[];

    if (ruleMatches) {
      buildList = () => filterIt(list, ruleMatches);
      filterArray = rules => rules.filter(ruleMatches);
    } else {
      buildList = () => list;
      filterArray = asis;
    }

    let ruleSet: Set<StypRule> | undefined; // `undefined` updates are not tracked

    this.onUpdate = onEventBy<[StypRule[], StypRule[]]>(receiver => {

      const rules = ruleSet || (ruleSet = new Set(buildList()));

      return onEventFrom(list)((added, removed) => {
        added = filterArray(added);
        removed = filterArray(removed);
        if (removed.length || added.length) {
          removed.forEach(rule => rules.delete(rule));
          added.forEach(rule => rules.add(rule));
          receiver(added, removed);
        }
      }).whenDone(() => {
        ruleSet = undefined;
      });
    }).share();

    this.read = afterEventFrom<[Rules]>(this.onUpdate.thru(valueProvider<this>(this)), [this]);

    this[Symbol.iterator] = () => {
      if (ruleSet) {
        // List changes are tracked.
        return ruleSet.values();
      }
      // List changes are not currently tracked.
      // Request the rules explicitly.
      return itsIterable(buildList());
    };

  }

  grab(query: StypQuery): StypRuleList {
    return grabRules(this, query);
  }

}

/**
 * @internal
 */
export function singleRuleList(rule: StypRule): StypRuleList {

  const rules = [rule];

  class Self implements StypRules {

    get [OnEvent__symbol]() {
      return onNever;
    }

    [Symbol.iterator](): IterableIterator<StypRule> {
      return itsIterable(rules);
    }

  }

  return new Rules(new Self());
}

/**
 * @internal
 */
export function grabRules(list: StypRuleList, query: StypQuery): StypRuleList {

  const q = stypQuery(query);

  return new Rules(list, rule => stypSelectorMatches(rule.selector, q));
}
