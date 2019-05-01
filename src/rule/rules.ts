import { itsEach } from 'a-iterable';
import {
  EventEmitter,
  eventInterest,
  EventSender,
  isEventSender,
  noEventInterest,
  OnEvent,
  OnEvent__symbol,
  onEventBy,
  onEventFrom
} from 'fun-events';
import { StypRule } from './rule';

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
   *   A `StypRule.list` is used instead.
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

const noStypRules: StypRules = {
  [Symbol.iterator](): IterableIterator<StypRule> {
    return [][Symbol.iterator]();
  },
  [OnEvent__symbol]() {
    return noEventInterest();
  }
};

/**
 * Constructs dynamically updated CSS rule set out of their sources.
 *
 * @param sources CSS rule sources.
 *
 * @returns Dynamic CSS rule set.
 */
export function stypRules(...sources: StypRules.Source[]): StypRules {
  return sources.length ? rulesByList(sources.map(rulesFromSource)) : noStypRules;
}

function rulesFromSource(source: StypRules.Source): StypRules {
  return typeof source === 'function' ? evalRules(source) : rulesByValue(source);
}

/**
 * Constructs lazily updated CSS rule set out of their sources.
 *
 * In contrast to [[stypRules]] this one does not evaluate sources (e.g. does not call source functions) until there
 * is an updates receiver registered.
 *
 * This means that the constructed rule set won't necessary contain the rules from all sources originally. It will
 * report them as updates instead.
 *
 * @param sources CSS rule sources.
 *
 * @returns Dynamic CSS rule set.
 */
export function lazyStypRules(...sources: StypRules.Source[]): StypRules {
  return sources.length ? rulesByList(sources.map(lazyRulesFromSource)) : noStypRules;
}

function lazyRulesFromSource(source: StypRules.Source): StypRules {
  return typeof source === 'function' ? lazyRules(source) : rulesByValue(source);
}

function rulesByList(sources: StypRules[]): StypRules {
  if (sources.length === 1) {
    return sources[0];
  }
  return {
    * [Symbol.iterator](): IterableIterator<StypRule> {
      for (const rules of sources) {
        yield* rules;
      }
    },
    get [OnEvent__symbol](): OnEvent<[StypRule[], StypRule[]]> {
      return onEventBy(receiver => {

        let sourceInterest = noEventInterest();
        const interest = eventInterest(reason => sourceInterest.off(reason));
        const sourceInterests = sources.map(rules => onEventFrom(rules)(receiver).needs(interest));

        sourceInterest = eventInterest(reason => {
          sourceInterests.forEach(i => i.off(reason));
        });

        return interest;
      });
    },
  };
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

  const emitter = new EventEmitter<[StypRule[], StypRule[]]>();
  let sharedInterest = noEventInterest();
  const ruleSet = new Set<StypRule>();

  return {
    [Symbol.iterator](): IterableIterator<StypRule> {
      return ruleSet.values();
    },
    [OnEvent__symbol](receiver) {
      if (!emitter.size) {

        const rules = rulesByValue(source());
        const existing: StypRule[] = [];

        itsEach(rules, rule => {
          existing.push(rule);
          ruleSet.add(rule);
        });

        if (existing.length) {
          receiver(existing, []); // Report existing rules as just added
        }
        sharedInterest = rules[OnEvent__symbol]((added, removed) => {
          removed.forEach(rule => ruleSet.delete(rule));
          added.forEach(rule => ruleSet.add(rule));
          emitter.send(added, removed);
        });
      }

      return emitter.on(receiver)
          .needs(sharedInterest)
          .whenDone(reason => {
            if (!emitter.size) {
              ruleSet.clear();
              sharedInterest.off(reason);
              sharedInterest = noEventInterest();
            }
          });
    }
  };
}

function rulesByValue(source: StypRule | StypRules | Promise<StypRule | StypRules>): StypRules {
  return source instanceof StypRule ? source.rules : isEventSender(source) ? source : asyncRules(source);
}

function asyncRules(source: Promise<StypRule | StypRules>): StypRules {

  const emitter = new EventEmitter<[StypRule[], StypRule[]]>();
  let sharedInterest = noEventInterest();
  const ruleSet = new Set<StypRule>();

  return {
    [Symbol.iterator](): IterableIterator<StypRule> {
      return ruleSet.values();
    },
    get [OnEvent__symbol](): OnEvent<[StypRule[], StypRule[]]> {
      return onEventBy<[StypRule[], StypRule[]]>(receiver => {

        let sourceInterest = noEventInterest();
        const interest = eventInterest(reason => sourceInterest.off(reason))
            .whenDone(reason => {
              sourceInterest.off(reason);
              if (!emitter.size) {
                ruleSet.clear();
                sharedInterest.off(reason);
                sharedInterest = noEventInterest();
              }
            });

        source.then(resolution => {
          if (!interest.done) {
            if (!emitter.size) {

              const rules = resolution instanceof StypRule ? resolution.rules : resolution;
              const existing: StypRule[] = [];

              itsEach(rules, rule => {
                existing.push(rule);
                ruleSet.add(rule);
              });
              if (existing.length) {
                receiver(existing, []); // Report existing rules as just added
              }

              sharedInterest = onEventFrom(rules)((added, removed) => {
                removed.forEach(rule => ruleSet.delete(rule));
                added.forEach(rule => ruleSet.add(rule));
                emitter.send(added, removed);
              });
            }

            sourceInterest = emitter.on(receiver).needs(interest).needs(sharedInterest);
          }
        });

        return interest;
      });
    },
  };
}
