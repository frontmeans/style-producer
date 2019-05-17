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
  it('normalizes `*` element', () => {
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
  it('handles attributes', () => {
    expect(stypSelector({ e: 'span', s: '[abc]' })).toEqual([{ e: 'span', s: '[abc]' }]);
  });
  it('removes empty attributes', () => {
    expect(stypSelector({ e: 'span', s: '' })).toEqual([{ e: 'span' }]);
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
      ]
    }]);
  });
});
