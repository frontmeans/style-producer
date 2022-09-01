import { doqryEqual } from '@frontmeans/doqry';
import { describe, expect, it } from '@jest/globals';
import { stypQuery } from './query';

describe('stypQuery', () => {
  it('normalizes query', () => {
    const query = stypQuery({ e: 'span', c: 'some' });

    expect(query).toMatchObject({ e: 'span', c: ['some'] });
    expect(doqryEqual(query, { e: 'span', c: ['some'] })).toBe(true);
  });
  it('returns normalized query itself', () => {
    const query = stypQuery({ e: 'span', c: 'some' });

    expect(stypQuery(query)).toBe(query);
  });
});
