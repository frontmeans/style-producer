import { stypSelector } from './selector';

describe('stypSelector', () => {
  it('converts string to raw selector', () => {
    expect(stypSelector('abc')).toEqual([{ s: 'abc' }]);
  });
  it('handles raw selectors', () => {
    expect(stypSelector({ s: 'abc' })).toEqual([{ s: 'abc' }]);
  });
  it('handles combinators', () => {
    expect(stypSelector(['abc', '>', { e: 'def' }])).toEqual([{ s: 'abc' }, '>', { e: 'def' }]);
  });
  it('handles ids', () => {
    expect(stypSelector({ i: 'abc' })).toEqual([{ i: 'abc' }]);
  });
  it('handles elements', () => {
    expect(stypSelector({ e: 'span' })).toEqual([{ e: 'span' }]);
  });
  it('normalizes classes', () => {
    expect(stypSelector({ c: 'abc' })).toEqual([{ c: ['abc'] }]);
  });
  it('sorts classes', () => {
    expect(stypSelector({ c: ['def', 'abc'] })).toEqual([{ c: ['abc', 'def'] }]);
  });
  it('handles pseudo-items', () => {
    expect(stypSelector({ e: 'span', x: '[abc]' })).toEqual([{ e: 'span', x: '[abc]' }]);
  });
});
