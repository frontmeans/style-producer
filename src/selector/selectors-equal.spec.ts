import { DEFAULT__NS, NamespaceDef } from 'namespace-aliaser';
import { stypSelectorsEqual } from './selectors-equal';

describe('stypSelectorsEqual', () => {

  let ns1: NamespaceDef;
  let ns2: NamespaceDef;

  beforeEach(() => {
    ns1 = new NamespaceDef('ns/1', 'ns1');
    ns2 = new NamespaceDef('ns/2', 'ns2');
  });

  it('compares length', () => {
    expect(stypSelectorsEqual([{ e: 'ul' }, '>', { e: 'li' }], [{ e: 'ul' }, { e: 'li' }])).toBe(false);
  });
  it('compares combinators', () => {
    expect(stypSelectorsEqual([{ e: 'h1' }, '>', { e: 'h2' }], [{ e: 'h1' }, '+', { e: 'h2' }])).toBe(false);
    expect(stypSelectorsEqual([{ e: 'h1' }, '>', { e: 'h2' }], [{ e: 'h1' }, '>', { e: 'h2' }])).toBe(true);
    expect(stypSelectorsEqual([{ e: 'h1' }, '>', { e: 'h2' }], [{ e: 'h1' }, { e: 'h2' }, { e: 'h3' }])).toBe(false);
    expect(stypSelectorsEqual([{ e: 'h1' }, { e: 'h2' }, { e: 'h3' }], [{ e: 'h1' }, '>', { e: 'h2' }])).toBe(false);
  });
  it('compares namespaces', () => {
    expect(stypSelectorsEqual([{ ns: 'a', e: 'span' }], [{ ns: 'b', e: 'span' }])).toBe(false);
    expect(stypSelectorsEqual([{ ns: 'a', e: 'span' }], [{ ns: ns2, e: 'span' }])).toBe(false);
    expect(stypSelectorsEqual([{ ns: 'a', e: 'span' }], [{ ns: 'a', e: 'span' }])).toBe(true);
    expect(stypSelectorsEqual([{ ns: ns1, e: 'span' }], [{ ns: 'b', e: 'span' }])).toBe(false);
    expect(stypSelectorsEqual([{ ns: ns1, e: 'span' }], [{ ns: ns2, e: 'span' }])).toBe(false);
    expect(stypSelectorsEqual([{ ns: ns1, e: 'span' }], [{ ns: ns1, e: 'span' }])).toBe(true);
    expect(stypSelectorsEqual([{ ns: 'a', e: 'span' }], [{ e: 'span' }])).toBe(false);
    expect(stypSelectorsEqual([{ e: 'span' }], [{ ns: 'b', e: 'span' }])).toBe(false);
  });
  it('compares names', () => {
    expect(stypSelectorsEqual([{ e: 'span' }], [{ e: 'div' }])).toBe(false);
    expect(stypSelectorsEqual([{ e: 'span' }], [{ e: ['span', ns2] }])).toBe(false);
    expect(stypSelectorsEqual([{ e: 'span' }], [{ e: 'span' }])).toBe(true);
    expect(stypSelectorsEqual([{ e: 'span' }], [{ e: ['span', DEFAULT__NS] }])).toBe(true);
    expect(stypSelectorsEqual([{ e: ['span', ns1] }], [{ e: ['div', ns1] }])).toBe(false);
    expect(stypSelectorsEqual([{ e: ['span', ns1] }], [{ e: ['span', ns2] }])).toBe(false);
    expect(stypSelectorsEqual([{ e: ['span', ns1] }], [{ e: 'span' }])).toBe(false);
    expect(stypSelectorsEqual([{ e: ['span', ns1] }], [{ s: 'some' }])).toBe(false);
    expect(stypSelectorsEqual([{ e: ['span', ns1] }], [{ e: ['span', ns1] }])).toBe(true);
    expect(stypSelectorsEqual([{ e: 'span' }], [{ s: 'some' }])).toBe(false);
    expect(stypSelectorsEqual([{ s: 'some' }], [{ e: 'span' }])).toBe(false);
  });
  it('compares classes', () => {
    expect(stypSelectorsEqual([{ c: ['a'] }], [{ c: ['b'] }])).toBe(false);
    expect(stypSelectorsEqual([{ c: ['a'] }], [{ c: ['a', 'c'] }])).toBe(false);
    expect(stypSelectorsEqual([{ c: ['a'] }], [{ c: [['a', ns1]] }])).toBe(false);
    expect(stypSelectorsEqual([{ c: ['a'] }], [{ c: ['a'] }])).toBe(true);
    expect(stypSelectorsEqual([{ c: [['a', ns1]] }], [{ c: ['b'] }])).toBe(false);
    expect(stypSelectorsEqual([{ c: [['a', ns1]] }], [{ c: [['a', ns2]] }])).toBe(false);
    expect(stypSelectorsEqual([{ c: [['a', ns1]] }], [{ c: [['b', ns1]] }])).toBe(false);
    expect(stypSelectorsEqual([{ c: [['a', ns1]] }], [{ c: [['a', ns1]] }])).toBe(true);
    expect(stypSelectorsEqual([{ c: ['a'] }], [{ s: 'some' }])).toBe(false);
    expect(stypSelectorsEqual([{ s: 'some' }], [{ c: ['a'] }])).toBe(false);
  });
  it('compares attribute sub-selectors', () => {
    expect(stypSelectorsEqual([{ u: [['attr']] }], [{ u: [['attr']] }])).toBe(true);
    expect(stypSelectorsEqual([{ u: [['attr']] }], [{ u: [['attr2']] }])).toBe(false);
    expect(stypSelectorsEqual([{ u: [['attr']] }], [{ u: [['attr', '=', 'value']] }])).toBe(false);
    expect(stypSelectorsEqual([{ u: [['attr', '=', 'value']] }], [{ u: [['attr', '=', 'value2']] }])).toBe(false);
    expect(stypSelectorsEqual([{ e: 'div', u: [['id']] }], [{ e: 'div' }])).toBe(false);
    expect(stypSelectorsEqual([{ e: 'div' }], [{ e: 'div', u: [['id']] }])).toBe(false);
    expect(stypSelectorsEqual([{ u: [['attr']] }], [{ u: [['attr'], ['attr2']] }])).toBe(false);
  });
  it('compares pseudo- sub-selectors', () => {
    expect(stypSelectorsEqual([{ u: [[':', 'host']] }], [{ u: [[':', 'host']] }])).toBe(true);
    expect(stypSelectorsEqual([{ u: [[':', 'before']] }], [{ u: [['::', 'before']] }])).toBe(false);
    expect(stypSelectorsEqual(
        [{ u: [[':', 'host', [{ c: ['active'] }]]] }],
        [{ u: [[':', 'host', [{ c: ['active'] }]]] }],
    )).toBe(true);
    expect(stypSelectorsEqual(
        [{ u: [[':', 'host', [{ c: ['active'] }]]] }],
        [{ u: [[':', 'host', [{ c: ['inactive'] }]]] }],
    )).toBe(false);
  });
  it('compares qualifiers', () => {
    expect(stypSelectorsEqual([{ $: ['a'] }], [{ $: ['b'] }])).toBe(false);
    expect(stypSelectorsEqual([{ $: ['a'] }], [{ $: ['a', 'c'] }])).toBe(false);
    expect(stypSelectorsEqual([{ $: ['a'] }], [{ $: ['a'] }])).toBe(true);
    expect(stypSelectorsEqual([{ $: ['a'] }], [{ s: 'some' }])).toBe(false);
    expect(stypSelectorsEqual([{ s: 'some' }], [{ $: ['a'] }])).toBe(false);
  });
});
