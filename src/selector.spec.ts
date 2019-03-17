import { stypSelector, stypSelectorString } from './selector';

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
  it('handles attributes', () => {
    expect(stypSelector({ e: 'span', x: '[abc]' })).toEqual([{ e: 'span', x: '[abc]' }]);
  });
});

describe('stypSelectorString', () => {
  it('prints raw selector', () => {
    expect(stypSelectorString('.some')).toBe('.some');
  });
  it('prints element name', () => {
    expect(stypSelectorString({ e: 'span' })).toBe('span');
  });
  it('prints namespace', () => {
    expect(stypSelectorString({ ns: 'foo', e: 'bar' })).toBe('foo|bar');
  });
  it('prints identifier', () => {
    expect(stypSelectorString({ i: 'foo:bar' })).toBe('#foo\\:bar');
  });
  it('prints classes', () => {
    expect(stypSelectorString({ c: ['foo', 'bar.baz'] })).toBe('.bar\\.baz.foo');
  });
  it('prints pseudo-items', () => {
    expect(stypSelectorString({ e: 'a', x: ':hover' })).toBe('a:hover');
  });
  it('prints combinations', () => {
    expect(stypSelectorString([{ e: 'ul' }, '>', { e: 'a' }, '+', { e: 'span', x: ':after' }])).toBe('ul>a+span:after');
  });
});
