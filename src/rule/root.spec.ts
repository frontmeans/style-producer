import { stypRoot } from './root';
import { StypRule } from './rule';
import { StypProperties } from './properties';

describe('stypRoot', () => {
  it('always returns new instance', () => {
    expect(stypRoot()).not.toBe(stypRoot());
  });

  describe('root', () => {
    it('points to itself', () => {

      const root = stypRoot();

      expect(root.root).toBe(root);
    });
  });

  describe('empty', () => {
    it('is `true`', () => {
      expect(stypRoot().empty).toBe(true);
    });
  });

  describe('selector', () => {
    it('is empty', () => {
      expect(stypRoot().selector).toHaveLength(0);
    });
  });

  describe('rules', () => {
    it('is empty by default', () => {
      expect([...stypRoot().rules]).toHaveLength(0);
    });
  });

  describe('read', () => {
    it('sends initial properties', async () => {

      const initial = { fontSize: '12px' };
      const root = stypRoot(initial);

      expect(await receiveProperties(root)).toEqual(initial);
    });
    it('sends empty properties by default', async () => {

      const root = stypRoot();

      expect(await receiveProperties(root)).toEqual({});
    });
  });
});

function receiveProperties(rule: StypRule): Promise<StypProperties> {
  return new Promise(resolve => rule.read(resolve));
}
