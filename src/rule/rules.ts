import { itsEach } from 'a-iterable';
import { noop } from 'call-thru';
import {
  eventInterest,
  EventReceiver,
  EventSender,
  isEventSender,
  noEventInterest,
  OnEvent,
  OnEvent__symbol,
  onEventBy,
  onEventFrom, receiveEventsBy
} from 'fun-events';
import { StypRule, StypRuleList } from './rule';
import { Rules } from './rules.impl';

/**
 * Dynamically updated CSS rule set.
 *
 * This is an iterable of rules, and an `EventSender` of their updates.
 */
export interface StypRules extends Iterable<StypRule>, EventSender<[StypRule[], StypRule[]]> {

  [Symbol.iterator](): IterableIterator<StypRule>;

}

export namespace StypRules {

  /**
   * A source of CSS rules.
   *
   * A dynamically updated CSS rule set can be constructed out of one or more sources by [[stypRules]] and
   * [[lazyStypRules]] functions.
   *
   * This can be one of:
   * - Single `StypRule` instance.
   *   A `StypRule.rules.self` is used instead. I.e. a list containing only the rule itself.
   * - A `StypRules` instance.
   *   It is used as is.
   * - A promise of one of the above.
   *   The resolved value is used as an actual source.
   *   No rules are available until resolution.
   * - A function returning one of the above.
   *   The function call result is used as an actual source.
   *   The function will be called lazily upon rules access.
   */
  export type Source =
      StypRule | StypRules
      | Promise<StypRule | StypRules>
      | ((this: void) => StypRule | StypRules | Promise<StypRule | StypRules>);

}

const noStypRules: StypRuleList = /*#__PURE__*/ new Rules({
  [Symbol.iterator](): IterableIterator<StypRule> {
    return [][Symbol.iterator]();
  },
  [OnEvent__symbol]() {
    return noEventInterest();
  }
});

/**
 * Constructs dynamically updated CSS rule list out of rule sources.
 *
 * @param sources CSS rule sources.
 *
 * @returns Dynamic CSS rule list.
 */
export function stypRules(...sources: StypRules.Source[]): StypRuleList {
  return sources.length ? rulesByList(sources.map(rulesFromSource)) : noStypRules;
}

function rulesFromSource(source: StypRules.Source): StypRules {
  return typeof source === 'function' ? evalRules(source) : rulesByValue(source);
}

/**
 * Constructs lazily updated CSS rule list out of rule sources.
 *
 * In contrast to [[stypRules]] this one does not evaluate sources (e.g. does not call source functions) until there
 * is an updates receiver registered.
 *
 * This means that the constructed rule set won't necessary contain the rules from all sources originally. It will
 * report them as updates instead.
 *
 * @param sources CSS rule sources.
 *
 * @returns Dynamic CSS rule list.
 */
export function lazyStypRules(...sources: StypRules.Source[]): StypRuleList {
  return sources.length ? rulesByList(sources.map(lazyRulesFromSource)) : noStypRules;
}

function lazyRulesFromSource(source: StypRules.Source): StypRules {
  return typeof source === 'function' ? lazyRules(source) : rulesByValue(source);
}

function rulesByList(sources: StypRules[]): StypRuleList {
  if (sources.length === 1) {

    const source = sources[0];

    return source instanceof StypRuleList ? source : new Rules(source);
  }
  return new Rules({
    * [Symbol.iterator](): IterableIterator<StypRule> {
      for (const rules of sources) {
        yield* rules;
      }
    },
    get [OnEvent__symbol](): OnEvent<[StypRule[], StypRule[]]> {
      return onEventBy<[StypRule[], StypRule[]]>(receiver => {

        let sourceInterest = noEventInterest();
        const interest = eventInterest(reason => sourceInterest.off(reason));
        const sourceInterests = sources.map(rules => onEventFrom(rules)(receiver).needs(interest));

        sourceInterest = eventInterest(reason => {
          sourceInterests.forEach(i => i.off(reason));
        });

        return interest;
      }).share();
    },
  });
}

function evalRules(source: (this: void) => StypRule | StypRules | Promise<StypRule | StypRules>): StypRules {

  let _rules: StypRules | undefined;

  return {
    [Symbol.iterator](): IterableIterator<StypRule> {
      return rules()[Symbol.iterator]();
    },
    get [OnEvent__symbol]() {
      return rules()[OnEvent__symbol];
    }
  };

  function rules(): StypRules {
    return _rules || (_rules = rulesByValue(source()));
  }
}

function lazyRules(source: (this: void) => StypRule | StypRules | Promise<StypRule | StypRules>): StypRules {

  const ruleSet = new Set<StypRule>();
  const onEvent = onEventBy(receiver => {

    const rules = rulesByValue(source());

    reportExistingRules(rules, ruleSet, receiver);

    return rules[OnEvent__symbol](function (added, removed) {
      removed.forEach(rule => ruleSet.delete(rule));
      added.forEach(rule => ruleSet.add(rule));
      receiver.call(this, added, removed);
    }).whenDone(() => {
      ruleSet.clear();
    });
  }).share();

  return {
    [OnEvent__symbol]: onEvent,
    [Symbol.iterator](): IterableIterator<StypRule> {
      return ruleSet.values();
    },
  };
}

function rulesByValue(source: StypRule | StypRules | Promise<StypRule | StypRules>): StypRules {
  return source instanceof StypRule ? source.rules.self : isEventSender(source) ? source : asyncRules(source);
}

function asyncRules(source: Promise<StypRule | StypRules>): StypRules {

  const ruleSet = new Set<StypRule>();
  const onEvent = onEventBy<[StypRule[], StypRule[]]>(receiver => {

    let sourceInterest = noEventInterest();
    const interest = eventInterest(noop)
        .whenDone(reason => {
          sourceInterest.off(reason);
          ruleSet.clear();
        });

    source.then(resolution => {
      if (!interest.done) {

        const rules = resolution instanceof StypRule ? resolution.rules : resolution;

        reportExistingRules(rules, ruleSet, receiver);

        sourceInterest = onEventFrom(rules)(function (added, removed) {
          removed.forEach(rule => ruleSet.delete(rule));
          added.forEach(rule => ruleSet.add(rule));
          receiver.call(this, added, removed);
        }).needs(interest);
      }
    });

    return interest;
  }).share();

  return {
    [OnEvent__symbol]: onEvent,
    [Symbol.iterator](): IterableIterator<StypRule> {
      return ruleSet.values();
    },
  };
}

function reportExistingRules(
    rules: StypRules,
    ruleSet: Set<StypRule>,
    receiver: EventReceiver<[StypRule[], StypRule[]]>) {

  const existing: StypRule[] = [];

  itsEach(rules, rule => {
    existing.push(rule);
    ruleSet.add(rule);
  });
  if (existing.length) {
    receiveEventsBy(receiver)(existing, []); // Report existing rules as just added
  }
}
