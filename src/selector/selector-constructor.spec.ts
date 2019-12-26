import { NamespaceDef } from 'namespace-aliaser';
import { stypSelector } from './selector-constructor';

describe('stypSelector', () => {

  let nsA: NamespaceDef;
  let nsB: NamespaceDef;

  beforeEach(() => {
    nsA = new NamespaceDef('test/A', 'A');
    nsB = new NamespaceDef('test/B', 'B');
  });

  it('converts string to raw selector', () => {
    expect(stypSelector('abc')).toEqual([{ s: 'abc' }]);
  });
  it('handles empty string', () => {
    expect(stypSelector('')).toEqual([{}]);
  });
  it('handles empty selector part', () => {
    expect(stypSelector({})).toEqual([{}]);
  });
  it('handles raw selector', () => {
    expect(stypSelector({ s: 'abc' })).toEqual([{ s: 'abc' }]);
  });
  it('handles empty raw selector', () => {
    expect(stypSelector({ s: '' })).toEqual([{}]);
  });
  it('handles combinators', () => {
    expect(stypSelector(['abc', '>', { e: 'def' }])).toEqual([{ s: 'abc' }, '>', { e: 'def' }]);
  });
  it('handles subsequent combinators', () => {
    expect(stypSelector([
      'abc',
      '>',
      '+',
      '~',
      { e: 'def' },
    ])).toEqual([
      { s: 'abc' },
      '>',
      {},
      '+',
      {},
      '~',
      { e: 'def' },
    ]);
  });
  it('handles trailing combinators', () => {
    expect(stypSelector(['abc', '>', '+'])).toEqual([{ s: 'abc' }, '>', {}, '+', {}]);
  });
  it('handles id', () => {
    expect(stypSelector({ i: 'abc' })).toEqual([{ i: 'abc' }]);
  });
  it('handles empty id', () => {
    expect(stypSelector({ i: '' })).toEqual([{}]);
  });
  it('handles element', () => {
    expect(stypSelector({ e: 'span' })).toEqual([{ e: 'span' }]);
  });
  it('handles empty element', () => {
    expect(stypSelector({ e: '' })).toEqual([{}]);
  });
  it('removes `*` element', () => {
    expect(stypSelector({ e: '*' })).toEqual([{}]);
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
  it('sorts namespaced classes', () => {
    expect(stypSelector({ c: [['def', nsA], ['abc', nsB]] })).toEqual([{ c: [['def', nsA], ['abc', nsB]] }]);
    expect(stypSelector({ c: [['def', nsB], ['abc', nsA]] })).toEqual([{ c: [['abc', nsA], ['def', nsB]] }]);
    expect(stypSelector({ c: [['def', nsA], ['abc', nsA]] })).toEqual([{ c: [['abc', nsA], ['def', nsA]] }]);
  });
  it('sorts namespaced and local classes', () => {
    expect(stypSelector({ c: ['def', ['abc', nsB]] })).toEqual([{ c: ['def', ['abc', nsB]] }]);
    expect(stypSelector({ c: [['def', nsA], 'abc'] })).toEqual([{ c: ['abc', ['def', nsA]] }]);
  });
  it('strips empty classes', () => {
    expect(stypSelector({ c: ['', 'abc', ''] })).toEqual([{ c: ['abc'] }]);
  });
  it('removes empty classes', () => {
    expect(stypSelector({ e: 'span', c: ['', ''] })).toEqual([{ e: 'span' }]);
  });
  it('normalizes attribute selector', () => {
    expect(stypSelector({ u: ['attr']})).toEqual([{ u: [['attr']]}]);
  });
  it('normalizes attribute selector with value', () => {
    expect(stypSelector({ u: ['attr', '^=', 'prefix', 'i']})).toEqual([{ u: [['attr', '^=', 'prefix', 'i']]}]);
  });
  it('normalizes pseudo-class', () => {
    expect(stypSelector({ u: [':', 'host']})).toEqual([{ u: [[':', 'host']]}]);
  });
  it('normalizes pseudo-element', () => {
    expect(stypSelector({ e: 'a', u: ['::', 'before']})).toEqual([{ e: 'a', u: [['::', 'before']]}]);
  });
  it('normalizes pseudo-class with raw parameter', () => {
    expect(stypSelector({
      e: 'li', u: [':', 'nth-child', '2'],
    })).toEqual([
      {
        e: 'li',
        u: [
          [':', 'nth-child', [{ s: '2' }]],
        ],
      },
    ]);
  });
  it('normalizes pseudo-class with simple selector as parameter', () => {
    expect(stypSelector({
      u: [':', 'is', { e: 'li', c: 'selected' }],
    })).toEqual([
      {
        u: [
          [':', 'is', [{ e: 'li', c: ['selected'] }]],
        ],
      },
    ]);
  });
  it('normalizes pseudo-class with compound selector as parameter', () => {
    expect(stypSelector({
      u: [':', 'is', { e: 'ul' }, '>', { e: 'li', c: 'selected' }],
    })).toEqual([
      {
        u: [
          [':', 'is', [{ e: 'ul' }, '>', { e: 'li', c: ['selected'] }]],
        ],
      },
    ]);
  });
  it('normalizes pseudo-class with multiple parameters', () => {
    expect(stypSelector({
      u: [':', 'is',
        [{ e: 'a', u: [':', 'active'] }],
        [{ e: 'a', u: [':', 'focus'] }],
      ],
    })).toEqual([
      {
        u: [
          [':', 'is',
            [{ e: 'a', u: [[':', 'active']] }],
            [{ e: 'a', u: [[':', 'focus']] }],
          ],
        ],
      },
    ]);
  });
  it('normalizes multiple sub-selectors', () => {
    expect(stypSelector({
      e: 'a',
      u: [
        ['href'],
        [':', 'nth-child', '2'],
        ['::', 'before'],
      ],
    })).toEqual([{
      e: 'a',
      u: [
        ['href'],
        [':', 'nth-child', [{ s: '2' }]],
        ['::', 'before'],
      ],
    }]);
  });
  it('removes empty sub-selectors array', () => {
    expect(stypSelector({ e: 'a', u: [] })).toEqual([{ e: 'a' }]);
  });
  it('handles suffix string', () => {
    expect(stypSelector({ e: 'span', s: '[abc]' })).toEqual([{ e: 'span', s: '[abc]' }]);
  });
  it('removes empty suffix string', () => {
    expect(stypSelector({ e: 'span', s: '' })).toEqual([{ e: 'span' }]);
  });
  it('retains `*` element if only sub-selectors present and the first one is pseudo', () => {
    expect(stypSelector({ e: '*', u: [':', 'hover'] })).toEqual([{ e: '*', u: [[':', 'hover']]}]);
  });
  it('removes `*` element if only sub-selectors present and the first one is attribute selector', () => {
    expect(stypSelector({ e: '*', u: ['disabled'] })).toEqual([{ u: [['disabled']]}]);
  });
  it('removes `*` element if first sub-selector is pseudo, but other selectors present', () => {
    expect(stypSelector({ e: '*', c: 'hover', u: [':', 'hover'] })).toEqual([
      { c: ['hover'], u: [[':', 'hover']]},
    ]);
  });
  it('normalizes qualifiers', () => {
    expect(stypSelector({ $: 'abc' })).toEqual([{ $: ['abc'] }]);
  });
  it('removes empty qualifier', () => {
    expect(stypSelector({ e: 'span', $: '' })).toEqual([{ e: 'span' }]);
  });
  it('strips empty qualifiers', () => {
    expect(stypSelector({ $: ['', 'abc'] })).toEqual([{ $: ['abc'] }]);
  });
  it('removes empty qualifiers', () => {
    expect(stypSelector({ e: 'span', $: ['', ''] })).toEqual([{ e: 'span' }]);
  });
  it('sorts qualifiers', () => {
    expect(stypSelector({ $: ['def', 'abc'] })).toEqual([{ $: ['abc', 'def'] }]);
  });
  it('exposes qualifiers', () => {
    expect(stypSelector({ $: ['foo:def', 'foo:z', 'bar:abc=vvv:xxx'] })).toEqual([{
      $: [
        'bar', 'bar:abc', 'bar:abc=vvv:xxx',
        'foo', 'foo:def', 'foo:z',
      ],
    }]);
  });
});
