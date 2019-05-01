import { filterIt, itsIterable } from 'a-iterable';
import { noop, valueProvider } from 'call-thru';
import {
  AfterEvent,
  afterEventFrom,
  EventEmitter,
  eventInterest,
  noEventInterest,
  OnEvent,
  onEventBy,
  onEventFrom
} from 'fun-events';
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

  constructor(list: StypRules, ruleMatches: (rule: StypRule) => boolean = valueProvider(true)) {
    super();

    const _emitter = new EventEmitter<[StypRule[], StypRule[]]>();
    let _listInterest = noEventInterest();
    let _rules: Set<StypRule> | undefined;

    this.onUpdate = onEventBy(receiver => {

      let sendInitial: undefined | (() => void) = noop;
      let registered = false;

      if (!_rules) {
        // This is a first receiver.
        // Start tracking the list changes.
        const rules = _rules = new Set(_buildList());

        _listInterest = onEventFrom(list)((added, removed) => {
          added = added.filter(ruleMatches);
          removed = removed.filter(ruleMatches);
          if (removed.length || added.length) {
            removed.forEach(rule => rules.delete(rule));
            added.forEach(rule => rules.add(rule));
            _emitter.send(added, removed);
            if (!registered) {
              sendInitial = () => {
                receiver(added, removed);
                sendInitial = noop;
              };
            }
          }
        });
      }

      const interest = _emitter.on(receiver);

      sendInitial();
      registered = true;

      return eventInterest(reason => {
        interest.off(reason);
        if (!_emitter.size) {
          // No more receivers left.
          // Stop tracking the list changes.
          _rules = undefined;
          _listInterest.off(reason);
        }
      }).needs(interest).needs(_listInterest);
    });
    this.read = afterEventFrom<[Rules]>(this.onUpdate.thru(() => this), [this]);
    this[Symbol.iterator] = () => {
      if (_rules) {
        // List changes are tracked.
        return _rules.values();
      }
      // List changes are not currently tracked.
      // Request the rules explicitly.
      return itsIterable(_buildList());
    };

    function _buildList(): Iterable<StypRule> {
      return filterIt(list, ruleMatches);
    }

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
