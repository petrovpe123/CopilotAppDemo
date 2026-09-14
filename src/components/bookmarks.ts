export const STORAGE_KEY = 'mona-bookmarks';

export interface Bookmark {
  url: string;
  slug: string;
}

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_LENGTH = 4;
const SLUG_PATTERN = /^mona-[0-9A-Za-z]{4}$/;

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(candidate);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new TypeError('Only HTTP and HTTPS URLs can be bookmarked.');
  }

  return url.toString();
}

export function generateSlug(random: () => number = Math.random): string {
  let value = '';

  for (let index = 0; index < SLUG_LENGTH; index += 1) {
    value += BASE62[Math.floor(random() * BASE62.length)];
  }

  return `mona-${value}`;
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

function isBookmark(value: unknown): value is Bookmark {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (typeof candidate.url !== 'string' || typeof candidate.slug !== 'string') {
    return false;
  }

  try {
    return normalizeUrl(candidate.url) === candidate.url && SLUG_PATTERN.test(candidate.slug);
  } catch {
    return false;
  }
}

export function parseBookmarks(value: string | null): Bookmark[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isBookmark) : [];
  } catch {
    return [];
  }
}
