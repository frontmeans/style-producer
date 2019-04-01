import { StypQuery, stypQuery, stypSelectorMatches } from './query';

describe('stypQuery', () => {
  it('normalizes query', () => {
    expect(stypQuery({ e: 'span', c: 'some' })).toEqual({ e: 'span', c: ['some'] });
  });
  it('returns `undefined` for empty query', () => {
    expect(stypQuery({})).toBeUndefined();
  });
});

describe('stypSelectorMatches', () => {
  it('requires non-empty selector', () => {
    expect(stypSelectorMatches([], { e: 'span' })).toBe(false);
  });
  it('requires the same element', () => {

    const query: StypQuery.Normalized = { e: 'span' };

    expect(stypSelectorMatches([{ e: 'span', c: ['some'] }], query)).toBe(true);
    expect(stypSelectorMatches([{ e: 'div', c: ['some'] }], query)).toBe(false);
    expect(stypSelectorMatches([{ c: ['some'] }], query)).toBe(false);
  });
  it('requires the same namespaced element', () => {

    const query: StypQuery.Normalized = { ns: 'some-ns', e: 'span' };

    expect(stypSelectorMatches([{ ns: 'some-ns', e: 'span', c: ['some'] }], query)).toBe(true);
    expect(stypSelectorMatches([{ e: 'span', c: ['some'] }], query)).toBe(false);
    expect(stypSelectorMatches([{ ns: 'some-ns', e: 'div', c: ['some'] }], query)).toBe(false);
    expect(stypSelectorMatches([{ c: ['some'] }], query)).toBe(false);
  });
  it('requires the same identifier', () => {

    const query: StypQuery.Normalized = { i: 'test' };

    expect(stypSelectorMatches([{ i: 'test', c: ['some'] }], query)).toBe(true);
    expect(stypSelectorMatches([{ i: 'other', c: ['some'] }], query)).toBe(false);
    expect(stypSelectorMatches([{ c: ['some'] }], query)).toBe(false);
  });
  it('requires matching classes', () => {

    const query: StypQuery.Normalized = { c: ['other', 'some'] };

    expect(stypSelectorMatches([{ e: 'span', c: ['other', 'some'] }], query)).toBe(true);
    expect(stypSelectorMatches([{ e: 'span' }], query)).toBe(false);
    expect(stypSelectorMatches([{ c: ['some'] }], query)).toBe(false);
    expect(stypSelectorMatches([{ c: ['other'] }], query)).toBe(false);
  });
  it('requires matching qualifiers', () => {

    const query: StypQuery.Normalized = { $: ['other', 'some'] };

    expect(stypSelectorMatches([{ e: 'span', $: ['other', 'some'] }], query)).toBe(true);
    expect(stypSelectorMatches([{ e: 'span' }], query)).toBe(false);
    expect(stypSelectorMatches([{ $: ['some'] }], query)).toBe(false);
    expect(stypSelectorMatches([{ $: ['other'] }], query)).toBe(false);
  });
});
