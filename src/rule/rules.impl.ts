import { filterIt, itsIterable } from '@proc7ts/a-iterable';
import { asis, valueProvider, valuesProvider } from '@proc7ts/call-thru';
import { AfterEvent, afterSent, EventReceiver, EventSupply, OnEvent, onEventBy, onSupplied } from '@proc7ts/fun-events';
import { stypQuery, StypQuery, stypSelectorMatches } from '../selector';
import { StypRule, StypRuleList } from './rule';
import { StypRules } from './rules';

/**
 * @internal
 */
export class Rules extends StypRuleList {

  private readonly _buildList: () => Iterable<StypRule>;
  private readonly _filterArray: (rules: StypRule[]) => StypRule[];
  // noinspection JSMismatchedCollectionQueryUpdate
  private _ruleSet?: Set<StypRule>; // `undefined` updates are not tracked

  constructor(private readonly _list: StypRules, ruleMatches?: (rule: StypRule) => boolean) {
    super();
    if (ruleMatches) {
      this._buildList = () => filterIt(_list, ruleMatches);
      this._filterArray = rules => rules.filter(ruleMatches);
    } else {
      this._buildList = () => _list;
      this._filterArray = asis;
    }
  }

  read(): AfterEvent<[StypRuleList]>;
  read(receiver: EventReceiver<[StypRuleList]>): EventSupply;
  read(receiver?: EventReceiver<[StypRuleList]>): AfterEvent<[StypRuleList]> | EventSupply {
    return (this.read = afterSent<[Rules]>(
        this.onUpdate().thru(valueProvider(this)),
        valuesProvider(this),
    ).F)(receiver);
  }

  onUpdate(): OnEvent<[StypRule[], StypRule[]]>;
  onUpdate(receiver: EventReceiver<[StypRule[], StypRule[]]>): EventSupply;
  onUpdate(receiver?: EventReceiver<[StypRule[], StypRule[]]>): OnEvent<[StypRule[], StypRule[]]> | EventSupply {
    return (this.onUpdate = onEventBy<[StypRule[], StypRule[]]>(receiver => {

      const rules = this._ruleSet || (this._ruleSet = new Set(this._buildList()));

      onSupplied(this._list).to({
        supply: receiver.supply.whenOff(() => this._ruleSet = undefined),
        receive: (context, added, removed) => {
          added = this._filterArray(added);
          removed = this._filterArray(removed);
          if (removed.length || added.length) {
            removed.forEach(rule => rules.delete(rule));
            added.forEach(rule => rules.add(rule));
            receiver.receive(context, added, removed);
          }
        },
      });
    }).share().F)(receiver);
  }

  [Symbol.iterator](): IterableIterator<StypRule> {
    if (this._ruleSet) {
      // List changes are tracked.
      return this._ruleSet.values();
    }
    // List changes are not currently tracked.
    // Request the rules explicitly.
    return itsIterable(this._buildList());
  }

  grab(query: StypQuery): StypRuleList {
    return grabRules(this, query);
  }

}

/**
 * @internal
 */
export function grabRules(list: StypRuleList, query: StypQuery): StypRuleList {

  const q = stypQuery(query);

  return new Rules(list, rule => stypSelectorMatches(rule.selector, q));
}
