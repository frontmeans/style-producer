import { stypSheet, StypSheet } from './sheet';
import { StypProperties, StypRule } from '../rule';
import { StypSelector } from '../selector';

describe('StypSheet', () => {

  let sheet: StypSheet;

  beforeEach(() => {
    sheet = stypSheet();
  });

  describe('root', () => {
    it('is empty by default', () => {
      expect(sheet.root.empty).toBe(true);
    });
    it('contains initial properties', async () => {

      const properties = { borderWidth: '1px' };

      expect(await receiveProperties(stypSheet(properties).root)).toEqual(properties);
    });
  });

  describe('add', () => {
    it('adds properties', async () => {

      const selector: StypSelector = { c: 'test' };
      const properties = { borderWidth: '1px' };
      const added = sheet.add(selector, properties);

      expect(added.root).toBe(sheet.root);
      expect(sheet.get(selector)).toBe(added);
      expect(await receiveProperties(added)).toEqual(properties);
    });
  });
});

function receiveProperties(rule: StypRule): Promise<StypProperties> {
  return new Promise(resolve => rule.read(resolve));
}
