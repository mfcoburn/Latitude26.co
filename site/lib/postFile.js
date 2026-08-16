import matter from 'gray-matter';

/** Turns a title into a URL-safe slug. */
export function slugify(value) {
  return (value ?? '')
    .toString()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Serialises a post back to Markdown with YAML frontmatter. */
export function buildPostMarkdown(fields) {
  const data = {
    title: fields.title,
    date: fields.date,
    author: fields.author,
    excerpt: fields.excerpt ?? '',
    cover: fields.cover ?? '',
    draft: Boolean(fields.draft),
  };

  // Normalise line endings so edits from a browser don't churn the diff.
  const body = (fields.body ?? '').replace(/\r\n/g, '\n').trim();

  return matter.stringify(`${body}\n`, data);
}

/** Parses a stored post into plain fields for the editor. */
export function parsePostMarkdown(raw) {
  const { data, content } = matter(raw);

  return {
    title: data.title ?? '',
    date: formatDateValue(data.date),
    author: data.author ?? '',
    excerpt: data.excerpt ?? '',
    cover: data.cover ?? '',
    draft: Boolean(data.draft),
    body: content.trim(),
  };
}

/** Normalises a frontmatter date to YYYY-MM-DD for <input type="date">. */
export function formatDateValue(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}
