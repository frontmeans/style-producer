import { describe, expect, it } from '@jest/globals';
import { StypQuery } from './query';
import { stypQueryMatch } from './query-match';

describe('stypSelectorMatches', () => {
  it('requires non-empty selector', () => {
    expect(stypQueryMatch([], { e: 'span' })).toBe(false);
  });
  it('requires the same element', () => {
    const query: StypQuery = { e: 'span' };

    expect(stypQueryMatch([{ e: 'span', c: ['some'] }], query)).toBe(true);
    expect(stypQueryMatch([{ e: 'div', c: ['some'] }], query)).toBe(false);
    expect(stypQueryMatch([{ c: ['some'] }], query)).toBe(false);
  });
  it('requires the same namespaced element', () => {
    const query: StypQuery = { ns: 'some-ns', e: 'span' };

    expect(stypQueryMatch([{ ns: 'some-ns', e: 'span', c: ['some'] }], query)).toBe(true);
    expect(stypQueryMatch([{ e: 'span', c: ['some'] }], query)).toBe(false);
    expect(stypQueryMatch([{ ns: 'some-ns', e: 'div', c: ['some'] }], query)).toBe(false);
    expect(stypQueryMatch([{ c: ['some'] }], query)).toBe(false);
  });
  it('requires the same identifier', () => {
    const query: StypQuery = { i: 'test' };

    expect(stypQueryMatch([{ i: 'test', c: ['some'] }], query)).toBe(true);
    expect(stypQueryMatch([{ i: 'other', c: ['some'] }], query)).toBe(false);
    expect(stypQueryMatch([{ c: ['some'] }], query)).toBe(false);
  });
  it('requires matching classes', () => {
    const query: StypQuery = { c: ['other', 'some'] };

    expect(stypQueryMatch([{ e: 'span', c: ['other', 'some'] }], query)).toBe(true);
    expect(stypQueryMatch([{ e: 'span' }], query)).toBe(false);
    expect(stypQueryMatch([{ c: ['some'] }], query)).toBe(false);
    expect(stypQueryMatch([{ c: ['other'] }], query)).toBe(false);
  });
  it('requires matching qualifiers', () => {
    const query: StypQuery = { $: ['other', 'some'] };

    expect(stypQueryMatch([{ e: 'span', $: ['other', 'some'] }], query)).toBe(true);
    expect(stypQueryMatch([{ e: 'span' }], query)).toBe(false);
    expect(stypQueryMatch([{ $: ['some'] }], query)).toBe(false);
    expect(stypQueryMatch([{ $: ['other'] }], query)).toBe(false);
  });
});
