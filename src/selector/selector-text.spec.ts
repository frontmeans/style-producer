import { DEFAULT__NS, NamespaceDef } from '@frontmeans/namespace-aliaser';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { stypSelectorText } from './selector-text';
import { stypRuleKeyText, stypSelectorDisplayText } from './selector-text.impl';

describe('stypSelectorText', () => {

  let ns: NamespaceDef;

  beforeEach(() => {
    ns = new NamespaceDef('test/url', 'test');
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
  it('formats default namespace', () => {
    expect(stypSelectorText({ ns: DEFAULT__NS, e: 'bar' })).toBe('bar');
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
  it('formats generic element in default namespace', () => {
    expect(stypSelectorText({ ns: DEFAULT__NS })).toBe('*');
  });
  it('formats identifier', () => {
    expect(stypSelectorText({ i: 'foo:bar' })).toBe('#foo\\:bar');
  });
  it('formats identifier in default namespace', () => {
    expect(stypSelectorText({ i: ['foo:bar', DEFAULT__NS] })).toBe('#foo\\:bar');
  });
  it('formats identifier from namespace', () => {
    expect(stypSelectorText({ i: ['foo:bar', ns] })).toBe('#test\\:foo\\:bar');
  });
  it('formats classes', () => {
    expect(stypSelectorText({ c: ['foo', 'bar.baz'] })).toBe('.bar\\.baz.foo');
  });
  it('formats classes from namespace', () => {
    expect(stypSelectorText({ c: ['foo', ['bar', ns]] })).toBe('.foo.bar\\@test');
  });
  it('formats attribute', () => {
    expect(stypSelectorText({ u: ['attr'] })).toBe('[attr]');
  });
  it('escapes attribute name', () => {
    expect(stypSelectorText({ u: ['test:attr'] })).toBe('[test\\:attr]');
  });
  it('escapes attribute value', () => {
    expect(stypSelectorText({ u: ['attr', '=', '"value"', 'i'] })).toBe('[attr="\\"value\\"" i]');
  });
  it('formats pseudo-element', () => {
    expect(stypSelectorText({ e: '*', u: ['::', 'visited'] })).toBe('*::visited');
  });
  it('formats pseudo-class with parameters', () => {
    expect(stypSelectorText({
      u: [
        ':',
        'is',
        [{ c: 'custom' }],
        [{ c: 'other' }],
      ],
    })).toBe(':is(.custom,.other)');
  });
  it('formats sub-selectors', () => {
    expect(stypSelectorText({ u: [['attr'], ['::', 'after']] })).toBe('[attr]::after');
  });
  it('formats selector suffix', () => {
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
