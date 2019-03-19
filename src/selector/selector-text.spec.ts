import { stypSelectorText } from './selector-text';

describe('stypSelectorText', () => {
  it('prints raw selector', () => {
    expect(stypSelectorText('.some')).toBe('.some');
  });
  it('prints element name', () => {
    expect(stypSelectorText({ e: 'span' })).toBe('span');
  });
  it('prints namespace', () => {
    expect(stypSelectorText({ ns: 'foo', e: 'bar' })).toBe('foo|bar');
  });
  it('prints identifier', () => {
    expect(stypSelectorText({ i: 'foo:bar' })).toBe('#foo\\:bar');
  });
  it('prints classes', () => {
    expect(stypSelectorText({ c: ['foo', 'bar.baz'] })).toBe('.bar\\.baz.foo');
  });
  it('prints pseudo-items', () => {
    expect(stypSelectorText({ e: 'a', s: ':hover' })).toBe('a:hover');
  });
  it('prints combinations', () => {
    expect(stypSelectorText([{ e: 'ul' }, '>', { e: 'a' }, '+', { e: 'span', s: ':after' }])).toBe('ul>a+span:after');
  });
});
