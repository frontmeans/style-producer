import { readProperties } from '../spec';
import { StypAngle, StypLength } from '../value';
import { stypRoot } from './root';
import { StypRule } from './rule';
import { refStypRule, StypRuleRef } from './rule-ref';
import { stypRulesResolver, StypRulesResolver } from './rules-resolver';

describe('stypRulesResolver', () => {

  interface Refs {
    first: StypRuleRef<{ $length: StypLength }>;
    second: StypRuleRef<{ $angle: StypAngle }>;
  }

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let resolver: StypRulesResolver<Refs>;

  beforeEach(() => {
    resolver = stypRulesResolver<Refs>({
      first: refStypRule({ c: 'first' }, { $length: StypLength.zero }),
      second: refStypRule({ c: 'second' }, { $angle: StypAngle.zero }),
    });
  });

  it('resolves rule references', async () => {

    const refs = resolver(root);

    expect(await readProperties(refs.first)).toEqual({ $length: StypLength.zero });
    expect(await readProperties(refs.second)).toEqual({ $angle: StypAngle.zero });
  });
});
