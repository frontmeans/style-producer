import { AfterEvent, mapAfter, OnEvent, onEventBy, onSupplied, shareOn } from '@proc7ts/fun-events';
import { asis, valueProvider } from '@proc7ts/primitives';
import { filterIt, itsIterator } from '@proc7ts/push-iterator';
import { stypQuery, StypQuery, stypQueryMatch } from '../query';
import { StypRule, StypRuleList } from './rule';
import { StypRules } from './rules';

/**
 * @internal
 */
export class StypRuleList$ extends StypRuleList {

  readonly read: AfterEvent<[StypRuleList]>;
  readonly onUpdate: OnEvent<[StypRule[], StypRule[]]>;
  private readonly _buildList: () => Iterable<StypRule>;
  // noinspection JSMismatchedCollectionQueryUpdate
  private _ruleSet?: Set<StypRule> | undefined; // `undefined` updates are not tracked

  constructor(private readonly _list: StypRules, ruleMatches?: (rule: StypRule) => boolean) {
    super();

    let filterArray: (rules: StypRule[]) => StypRule[];

    if (ruleMatches) {
      this._buildList = () => filterIt(_list, ruleMatches);
      filterArray = rules => rules.filter(ruleMatches);
    } else {
      this._buildList = valueProvider(_list);
      filterArray = asis;
    }

    this.onUpdate = onEventBy<[StypRule[], StypRule[]]>(receiver => {
      const rules = this._ruleSet || (this._ruleSet = new Set(this._buildList()));

      onSupplied(this._list)({
        supply: receiver.supply.whenOff(() => (this._ruleSet = undefined)),
        receive: (context, added, removed) => {
          added = filterArray(added);
          removed = filterArray(removed);
          if (removed.length || added.length) {
            removed.forEach(rule => rules.delete(rule));
            added.forEach(rule => rules.add(rule));
            receiver.receive(context, added, removed);
          }
        },
      });
    }).do(shareOn);

    const returnSelf = valueProvider(this);

    this.read = this.onUpdate.do(mapAfter(returnSelf, returnSelf));
  }

  [Symbol.iterator](): IterableIterator<StypRule> {
    if (this._ruleSet) {
      // List changes are tracked.
      return this._ruleSet.values();
    }

    // List changes are not currently tracked.
    // Request the rules explicitly.
    return itsIterator(this._buildList());
  }

  grab(query: StypQuery): StypRuleList {
    return StypRuleList$grab(this, query);
  }

}

/**
 * @internal
 */
export function StypRuleList$grab(list: StypRuleList, query: StypQuery): StypRuleList {
  const q = stypQuery(query);

  return new StypRuleList$(list, rule => stypQueryMatch(rule.selector, q));
}
