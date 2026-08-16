import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import yaml from 'js-yaml';
import { marked } from 'marked';

// Content lives in site/content so that it is inside the Vercel project's
// Root Directory. Decap writes to the same paths (prefixed with `site/`,
// since Decap paths are relative to the repository root).
const CONTENT_DIR = path.join(process.cwd(), 'content');

/** Render a Markdown string to HTML. Returns '' for empty/missing input. */
export function renderMarkdown(md) {
  if (!md || !md.trim()) return '';
  return marked.parse(md.trim(), { async: false });
}

/** Read a YAML file from content/ and return the parsed object. */
async function readYaml(relativePath) {
  const raw = await fs.readFile(path.join(CONTENT_DIR, relativePath), 'utf8');
  return yaml.load(raw) ?? {};
}

/**
 * Read a Markdown file with frontmatter.
 * Returns the frontmatter fields plus `body` (raw md) and `bodyHtml`.
 */
async function readMarkdown(relativePath) {
  const raw = await fs.readFile(path.join(CONTENT_DIR, relativePath), 'utf8');
  const { data, content } = matter(raw);
  return { ...data, body: content, bodyHtml: renderMarkdown(content) };
}

/** Global settings singleton — tagline, locations, contact, CTA. */
export async function getSettings() {
  return readYaml('settings/site.yml');
}

/** A single page's content, e.g. getPage('home'). */
export async function getPage(slug) {
  return readMarkdown(`pages/${slug}.md`);
}

/** A legal placeholder page, e.g. getLegalPage('privacy'). */
export async function getLegalPage(slug) {
  return readMarkdown(`legal/${slug}.md`);
}

/**
 * Every entry in a folder collection ('services', 'providers'), sorted by the
 * `order` frontmatter field then by filename. Adding a file adds an entry.
 */
export async function getCollection(name) {
  const dir = path.join(CONTENT_DIR, name);
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));

  const entries = await Promise.all(
    files.map(async (file) => ({
      slug: file.replace(/\.md$/, ''),
      ...(await readMarkdown(`${name}/${file}`)),
    }))
  );

  return entries.sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999) || a.slug.localeCompare(b.slug)
  );
}
