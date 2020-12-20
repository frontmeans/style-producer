import { afterSupplied, onceAfter } from '@proc7ts/fun-events';
import { StypAngle, StypLength } from '../value';
import { stypRoot } from './root';
import { StypRule } from './rule';
import { RefStypRule } from './rule-ref';
import { StypRuleRefs } from './rule-refs';

describe('StypRuleRefs', () => {

  interface Props {
    first: { $length: StypLength };
    second: { $angle: StypAngle };
  }

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let refs: StypRuleRefs<Props>;

  beforeEach(() => {
    refs = StypRuleRefs.by<Props>(
        {
          first: RefStypRule.by({ c: 'first' }, { $length: StypLength.zero }),
          second: RefStypRule.by({ c: 'second' }, { $angle: StypAngle.zero }),
        },
        root,
    );
  });

  it('resolves rule references', async () => {
    expect(await afterSupplied(refs.refs.first)).toEqual({ $length: StypLength.zero });
    expect(await afterSupplied(refs.refs.second)).toEqual({ $angle: StypAngle.zero });
  });

  describe('read', () => {
    it('reads properties', () => {

      const mockMapReceiver = jest.fn<void, [Props]>();

      refs.read.do(onceAfter)(mockMapReceiver);

      expect(mockMapReceiver).toHaveBeenCalledWith({
        first: { $length: StypLength.zero },
        second: { $angle: StypAngle.zero },
      });
    });
  });

  describe('[AfterEvent__symbol]', () => {
    it('is the same as `read`', () => {
      expect(afterSupplied(refs)).toBe(refs.read);
    });
  });
});
