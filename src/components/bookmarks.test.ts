import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formatBookmark, generateSlug, normalizeUrl, parseBookmarks } from './bookmarks.ts';

describe('normalizeUrl', () => {
  it('normalizes a URL with or without https to the same value', () => {
    assert.equal(normalizeUrl('www.example.com'), normalizeUrl('https://www.example.com'));
  });
});

describe('generateSlug', () => {
  it('generates a short base62 slug with the mona prefix', () => {
    assert.match(generateSlug(() => 0.5), /^mona-[0-9A-Za-z]{4}$/);
  });
});

describe('parseBookmarks', () => {
  const invalidValues: Array<[string, string | null]> = [
    ['empty storage', null],
    ['an empty string', ''],
    ['corrupted JSON', '{not-json'],
    ['a legacy shape', '[{"originalUrl":"https://example.com","shortUrl":"old-1"}]'],
    ['a non-array value', '"https://example.com"'],
  ];

  for (const [scenario, value] of invalidValues) {
    it(`recovers from ${scenario}`, () => {
      assert.doesNotThrow(() => parseBookmarks(value));
      assert.deepEqual(parseBookmarks(value), []);
    });
  }

  it('keeps valid bookmarks and drops malformed entries', () => {
    const stored = JSON.stringify([
      { url: 'https://example.com/', slug: 'mona-7fk2' },
      { url: 'javascript:alert(1)', slug: 'mona-bad1' },
      { url: 'https://example.org/', slug: 12 },
    ]);

    assert.deepEqual(parseBookmarks(stored), [
      { url: 'https://example.com/', slug: 'mona-7fk2' },
    ]);
  });
});

describe('formatBookmark', () => {
  it('uses the exact visible separator', () => {
    assert.equal(
      formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
      'https://www.example.com :: mona-7fk2',
    );
  });
});
