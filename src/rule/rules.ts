import {
  EventNotifier,
  EventReceiver,
  EventSender,
  isEventSender,
  OnEvent,
  OnEvent__symbol,
  onEventBy,
  onNever,
  onSupplied,
  shareOn,
} from '@proc7ts/fun-events';
import { itsEach } from '@proc7ts/push-iterator';
import { neverSupply, Supply } from '@proc7ts/supply';
import { StypRule, StypRuleList } from './rule';
import { StypRuleList$ } from './rules.impl';

/**
 * Dynamically updated CSS rule set.
 *
 * This is an iterable of rules, and an `EventSender` of their updates.
 *
 * @category CSS Rule
 */
export interface StypRules extends Iterable<StypRule>, EventSender<[StypRule[], StypRule[]]> {
  [Symbol.iterator](): IterableIterator<StypRule>;
}

/**
 * @category CSS Rule
 */
export namespace StypRules {
  /**
   * A source of CSS rules.
   *
   * A dynamically updated CSS rule set can be constructed out of one or more sources by {@link stypRules} and
   * {@link lazyStypRules} functions.
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
    | StypRule
    | StypRules
    | Promise<StypRule | StypRules>
    | ((this: void) => StypRule | StypRules | Promise<StypRule | StypRules>);
}

/**
 * @internal
 */
const noStypRules: StypRuleList = /*#__PURE__*/ new StypRuleList$({
  [OnEvent__symbol]() {
    return onNever;
  },
  [Symbol.iterator](): IterableIterator<StypRule> {
    return [][Symbol.iterator]();
  },
});

/**
 * Constructs dynamically updated CSS rule list out of rule sources.
 *
 * @category CSS Rule
 * @param sources - CSS rule sources.
 *
 * @returns Dynamic CSS rule list.
 */
export function stypRules(...sources: StypRules.Source[]): StypRuleList {
  return sources.length ? rulesByList(sources.map(rulesFromSource)) : noStypRules;
}

/**
 * @internal
 */
function rulesFromSource(source: StypRules.Source): StypRules {
  return typeof source === 'function' ? evalRules(source) : rulesByValue(source);
}

/**
 * Constructs lazily updated CSS rule list out of rule sources.
 *
 * In contrast to {@link stypRules} this one does not evaluate sources (e.g. does not call source functions) until there
 * is an updates receiver registered.
 *
 * This means that the constructed rule set won't necessary contain the rules from all sources originally. It will
 * report them as updates instead.
 *
 * @category CSS Rule
 * @param sources - CSS rule sources.
 *
 * @returns Dynamic CSS rule list.
 */
export function lazyStypRules(...sources: StypRules.Source[]): StypRuleList {
  return sources.length ? rulesByList(sources.map(lazyRulesFromSource)) : noStypRules;
}

/**
 * @internal
 */
function lazyRulesFromSource(source: StypRules.Source): StypRules {
  return typeof source === 'function' ? lazyRules(source) : rulesByValue(source);
}

/**
 * @internal
 */
function rulesByList(sources: StypRules[]): StypRuleList {
  if (sources.length === 1) {
    const source = sources[0];

    return source instanceof StypRuleList ? source : new StypRuleList$(source);
  }

  return new StypRuleList$({
    *[Symbol.iterator](): IterableIterator<StypRule> {
      for (const rules of sources) {
        yield* rules;
      }
    },
    [OnEvent__symbol](): OnEvent<[StypRule[], StypRule[]]> {
      return onEventBy<[StypRule[], StypRule[]]>(receiver => {
        sources.forEach(source => onSupplied(source)({
            supply: new Supply().needs(receiver.supply),
            receive(context, added, removed) {
              receiver.receive(context, added, removed);
            },
          }));
      }).do(shareOn);
    },
  });
}

/**
 * @internal
 */
function evalRules(
  source: (this: void) => StypRule | StypRules | Promise<StypRule | StypRules>,
): StypRules {
  let rules: StypRules | undefined;
  const getRules = (): StypRules => rules || (rules = rulesByValue(source()));

  return {
    [Symbol.iterator](): IterableIterator<StypRule> {
      return getRules()[Symbol.iterator]();
    },
    [OnEvent__symbol]() {
      return getRules()[OnEvent__symbol]();
    },
  };
}

/**
 * @internal
 */
function lazyRules(
  source: (this: void) => StypRule | StypRules | Promise<StypRule | StypRules>,
): StypRules {
  const ruleSet = new Set<StypRule>();
  const onEvent = onEventBy<[StypRule[], StypRule[]]>(receiver => {
    const rules = rulesByValue(source());

    reportExistingRules(rules, ruleSet, receiver);
    rules[OnEvent__symbol]()({
      supply: receiver.supply.whenOff(() => ruleSet.clear()),
      receive(context, added, removed) {
        removed.forEach(rule => ruleSet.delete(rule));
        added.forEach(rule => ruleSet.add(rule));
        receiver.receive(context, added, removed);
      },
    });
  }).do(shareOn);

  return {
    [OnEvent__symbol]() {
      return onEvent;
    },
    [Symbol.iterator](): IterableIterator<StypRule> {
      return ruleSet.values();
    },
  };
}

/**
 * @internal
 */
function rulesByValue(source: StypRule | StypRules | Promise<StypRule | StypRules>): StypRules {
  return source instanceof StypRule
    ? source.rules.self
    : isEventSender(source)
    ? source
    : asyncRules(source);
}

/**
 * @internal
 */
function asyncRules(source: Promise<StypRule | StypRules>): StypRules {
  const ruleSet = new Set<StypRule>();
  const onEvent = onEventBy<[StypRule[], StypRule[]]>(receiver => {
    let sourceSupply = neverSupply();
    const { supply } = receiver;

    supply.cuts(sourceSupply).whenOff(() => ruleSet.clear());

    source
      .then(resolution => {
        if (!supply.isOff) {
          const rules = resolution instanceof StypRule ? resolution.rules : resolution;

          reportExistingRules(rules, ruleSet, receiver);

          sourceSupply = onSupplied(rules)({
            receive(context, added, removed) {
              removed.forEach(rule => ruleSet.delete(rule));
              added.forEach(rule => ruleSet.add(rule));
              receiver.receive(context, added, removed);
            },
          }).needs(supply);
        }
      })
      .catch(error => supply.off(error));
  }).do(shareOn);

  return {
    [OnEvent__symbol]() {
      return onEvent;
    },
    [Symbol.iterator](): IterableIterator<StypRule> {
      return ruleSet.values();
    },
  };
}

/**
 * @internal
 */
function reportExistingRules(
  rules: StypRules,
  ruleSet: Set<StypRule>,
  receiver: EventReceiver.Generic<[StypRule[], StypRule[]]>,
): void {
  const existing: StypRule[] = [];

  itsEach(rules, rule => {
    existing.push(rule);
    ruleSet.add(rule);
  });
  if (existing.length) {
    const dispatcher = new EventNotifier<[StypRule[], StypRule[]]>();

    dispatcher.on(receiver);
    dispatcher.send(existing, []); // Report existing rules as just added
  }
}
