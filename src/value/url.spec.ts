import { StypPriority } from './priority';
import { StypLength } from './unit';
import { StypURL } from './url';

describe('StypURL', () => {

  let url: string;
  let value: StypURL;

  beforeEach(() => {
    url = 'http://localhost.localdomain/some/path';
    value = new StypURL(url);
  });

  describe('prioritize', () => {
    it('returns itself for the same priority', () => {
      expect(value.usual()).toBe(value);
    });
    it('changes priority', () => {

      const important = value.important();

      expect(important).not.toBe(value);
      expect(important.priority).toBe(StypPriority.Important);
      expect(important.url).toBe(value.url);
      expect(important).toEqual(value.important());
    });
  });

  describe('is', () => {
    it('equals to itself', () => {
      expect(value.is(value)).toBe(true);
    });
    it('equals to the same URL', () => {
      expect(value.is(new StypURL(value.url))).toBe(true);
    });
    it('not equal to different URL', () => {
      expect(value.is(new StypURL('./other'))).toBe(false);
    });
    it('not equal to scalar value', () => {
      expect(value.is(value.url)).toBe(false);
    });
    it('not equal to different value type', () => {
      expect(value.is(StypLength.of(16, 'px'))).toBe(false);
    });
    it('not equal to the same value with different priority', () => {
      expect(value.is(value.important())).toBe(false);
    });
    it('equals to the same value with the same priority', () => {
      expect(value.is(value.important().usual())).toBe(true);
    });
  });

  describe('by', () => {
    it('recognizes plain URL string', () => {
      expect(value.is(StypURL.by(url))).toBe(true);
    });
    it('recognizes important URL string', () => {
      expect(value.important().is(StypURL.by(`${url} !important`))).toBe(true);
    });
    it('recognizes URL', () => {
      expect(StypURL.by(value)).toBe(value);
    });
    it('does not recognize non-string value', () => {
      expect(StypURL.by(1)).toBeUndefined();
    });
    it('does not recognize incompatible value', () => {
      expect(StypURL.by(StypLength.zero)).toBeUndefined();
    });
    it('replaces by itself when not recognized', () => {
      expect(value.by(123)).toBe(value);
    });
    it('does not replace recognized URL', () => {

      const other = new StypURL('./other');

      expect(value.by(other)).toBe(other);
    });
  });

  describe('toString', () => {
    it('escapes CSS string', () => {
      expect(new StypURL('http://some.host/(abc)\u042a').toString()).toBe('url(\'http://some.host/(abc)\\42A\')');
    });
  });
});
