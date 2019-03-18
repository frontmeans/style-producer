import { stypSelector, stypSelectorString } from './selector';

describe('stypSelector', () => {
  it('converts string to raw selector', () => {
    expect(stypSelector('abc')).toEqual([{ s: 'abc' }]);
  });
  it('converts empty string to empty selector', () => {
    expect(stypSelector('')).toHaveLength(0);
  });
  it('handles empty selector', () => {
    expect(stypSelector({})).toHaveLength(0);
  });
  it('handles raw selector', () => {
    expect(stypSelector({ s: 'abc' })).toEqual([{ s: 'abc' }]);
  });
  it('handles empty raw selector', () => {
    expect(stypSelector({ s: '' })).toHaveLength(0);
  });
  it('handles combinators', () => {
    expect(stypSelector(['abc', '>', { e: 'def' }])).toEqual([{ s: 'abc' }, '>', { e: 'def' }]);
  });
  it('handles id', () => {
    expect(stypSelector({ i: 'abc' })).toEqual([{ i: 'abc' }]);
  });
  it('handles empty id', () => {
    expect(stypSelector({ i: '' })).toHaveLength(0);
  });
  it('handles element', () => {
    expect(stypSelector({ e: 'span' })).toEqual([{ e: 'span' }]);
  });
  it('handles empty element', () => {
    expect(stypSelector({ e: '' })).toHaveLength(0);
  });
  it('normalizes classes', () => {
    expect(stypSelector({ c: 'abc' })).toEqual([{ c: ['abc'] }]);
  });
  it('removes empty class', () => {
    expect(stypSelector({ e: 'span', c: '' })).toEqual([{ e: 'span' }]);
  });
  it('sorts classes', () => {
    expect(stypSelector({ c: ['def', 'abc'] })).toEqual([{ c: ['abc', 'def'] }]);
  });
  it('strips empty classes', () => {
    expect(stypSelector({ c: ['', 'abc', ''] })).toEqual([{ c: ['abc'] }]);
  });
  it('removes empty classes', () => {
    expect(stypSelector({ e: 'span', c: ['', ''] })).toEqual([{ e: 'span' }]);
  });
  it('handles attributes', () => {
    expect(stypSelector({ e: 'span', s: '[abc]' })).toEqual([{ e: 'span', s: '[abc]' }]);
  });
  it('removes empty attributes', () => {
    expect(stypSelector({ e: 'span', s: '' })).toEqual([{ e: 'span' }]);
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
    expect(stypSelectorString({ e: 'a', s: ':hover' })).toBe('a:hover');
  });
  it('prints combinations', () => {
    expect(stypSelectorString([{ e: 'ul' }, '>', { e: 'a' }, '+', { e: 'span', s: ':after' }])).toBe('ul>a+span:after');
  });
});
