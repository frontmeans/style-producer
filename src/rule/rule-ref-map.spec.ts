import { readProperties } from '../spec';
import { StypAngle, StypLength } from '../value';
import { stypRoot } from './root';
import { StypRule } from './rule';
import { refStypRule } from './rule-ref';
import { mapStypRuleRefs, MapStypRuleRefs, readStypRuleRefMap } from './rule-ref-map';

describe('mapStypRuleRefs', () => {

  interface Props {
    first: { $length: StypLength };
    second: { $angle: StypAngle };
  }

  let root: StypRule;

  beforeEach(() => {
    root = stypRoot();
  });

  let mapRefs: MapStypRuleRefs<Props>;

  beforeEach(() => {
    mapRefs = mapStypRuleRefs<Props>({
      first: refStypRule({ c: 'first' }, { $length: StypLength.zero }),
      second: refStypRule({ c: 'second' }, { $angle: StypAngle.zero }),
    });
  });

  it('resolves rule references', async () => {

    const refs = mapRefs(root);

    expect(await readProperties(refs.first)).toEqual({ $length: StypLength.zero });
    expect(await readProperties(refs.second)).toEqual({ $angle: StypAngle.zero });
  });

  describe('readStypRuleRefMap', () => {
    it('reads properties', async () => {

      const refs = mapRefs(root);
      const result = readStypRuleRefMap<Props>(refs);
      const mockMapReceiver = jest.fn<void, [Props]>();

      result.once(mockMapReceiver);

      expect(mockMapReceiver).toHaveBeenCalledWith({
        first: { $length: StypLength.zero },
        second: { $angle: StypAngle.zero },
      });
    });
  });
});
