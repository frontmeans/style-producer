import { ruleProperties } from '../spec';
import { stypRoot } from './root';

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

  describe('nested', () => {
    it('is empty by default', () => {
      expect([...stypRoot().rules.nested]).toHaveLength(0);
    });
  });

  describe('read', () => {
    it('sends initial properties', async () => {

      const initial = { fontSize: '12px' };
      const root = stypRoot(initial);

      expect(await ruleProperties(root)).toEqual(initial);
    });
    it('sends empty properties by default', async () => {

      const root = stypRoot();

      expect(await ruleProperties(root)).toEqual({});
    });
  });
});
