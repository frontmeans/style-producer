import { stypSelectorText } from './selector-text';
import { stypRuleKeyText, stypSelectorDisplayText } from './selector-text.impl';
import { NamespaceDef, NamespaceAliaser, newNamespaceAliaser } from '../ns';

describe('stypSelectorText', () => {

  let ns: NamespaceDef;
  let nsQualifier: NamespaceAliaser;

  beforeEach(() => {
    ns = new NamespaceDef('test/url', 'test');
    nsQualifier = newNamespaceAliaser();
  });

  it('formats raw selector', () => {
    expect(stypSelectorText('.some')).toBe('.some');
  });
  it('formats element name', () => {
    expect(stypSelectorText({ e: 'span' })).toBe('span');
  });
  it('formats element name from namespace', () => {
    expect(stypSelectorText({ e: ['span', ns] })).toBe('test-span');
  });
  it('formats namespace', () => {
    expect(stypSelectorText({ ns: 'foo', e: 'bar' })).toBe('foo|bar');
  });
  it('formats qualified namespace', () => {
    expect(stypSelectorText({ ns, e: 'bar' })).toBe('test|bar');
  });
  it('formats generic element', () => {
    expect(stypSelectorText({ $: 'foo' })).toBe('*');
  });
  it('formats generic namespaced element', () => {
    expect(stypSelectorText({ ns: 'foo' })).toBe('foo|*');
  });
  it('formats generic element in qualified namespace', () => {
    expect(stypSelectorText({ ns })).toBe('test|*');
  });
  it('formats identifier', () => {
    expect(stypSelectorText({ i: 'foo:bar' })).toBe('#foo\\:bar');
  });
  it('formats identifier from namespace', () => {
    expect(stypSelectorText({ i: ['foo:bar', ns] })).toBe('#test-foo\\:bar');
  });
  it('formats classes', () => {
    expect(stypSelectorText({ c: ['foo', 'bar.baz'] })).toBe('.bar\\.baz.foo');
  });
  it('formats classes from namespace', () => {
    expect(stypSelectorText({ c: ['foo', ['bar', ns]] })).toBe('.foo.bar\\@test');
  });
  it('formats pseudo-items', () => {
    expect(stypSelectorText({ e: 'a', s: ':hover' })).toBe('a:hover');
  });
  it('formats combinations', () => {
    expect(stypSelectorText([{ e: 'ul' }, '>', { e: 'a' }, '+', { e: 'span', s: ':after' }])).toBe('ul>a+span:after');
  });
  it('separates parts', () => {
    expect(stypSelectorText([{ e: 'ul' }, { e: 'a' }, { e: 'span', s: ':after' }])).toBe('ul a span:after');
  });
  it('ignores qualifiers', () => {
    expect(stypSelectorText({ e: 'span', $: 'foo' })).toBe('span');
  });
  it('formats qualifiers by second argument', () => {
    expect(stypSelectorText({ e: 'span', $: ['foo', 'bar'] }, { qualify(q) { return `@${q}`; } })).toBe('span@bar@foo');
  });
});

describe('stypRuleKeyText', () => {
  it('formats qualifiers', () => {
    expect(stypRuleKeyText([{ e: 'span', $: ['foo:bar'] }])).toBe('span@foo\\:bar');
  });
});

describe('stypSelectorDisplayText', () => {
  it('formats qualifiers', () => {
    expect(stypSelectorDisplayText([{ e: 'span', $: ['foo:bar=baz'] }])).toBe('span@foo:bar=baz');
  });
});
