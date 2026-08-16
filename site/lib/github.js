/**
 * Minimal GitHub contents-API client for the admin.
 *
 * The token lives only on the server — it is never sent to the browser, so the
 * editor can commit on Colleen's behalf without her holding repository access.
 *
 * Env vars:
 *   GITHUB_TOKEN   fine-grained PAT with Contents: Read and write on this repo
 *   GITHUB_REPO    owner/name (defaults to mfcoburn/Latitude26.co)
 *   GITHUB_BRANCH  branch to commit to (defaults to main)
 */

const API = 'https://api.github.com';

function repo() {
  return process.env.GITHUB_REPO ?? 'mfcoburn/Latitude26.co';
}

function branch() {
  return process.env.GITHUB_BRANCH ?? 'main';
}

async function ghFetch(path, options = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is not configured.');

  const response = await fetch(`${API}${path}`, {
    ...options,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub ${response.status}: ${detail.slice(0, 300)}`);
  }

  return response.json();
}

/** Every Markdown file in a content directory, as {name, path, sha}. */
export async function listFolderFiles(folder) {
  const entries = await ghFetch(
    `/repos/${repo()}/contents/${encodeURI(folder)}?ref=${branch()}`
  );

  if (!Array.isArray(entries)) return [];

  return entries
    .filter((entry) => entry.type === 'file' && entry.name.endsWith('.md'))
    .map((entry) => ({ name: entry.name, path: entry.path, sha: entry.sha }));
}

/** File contents plus its blob sha, or null when absent. */
export async function readFile(path) {
  const data = await ghFetch(
    `/repos/${repo()}/contents/${encodeURI(path)}?ref=${branch()}`
  );
  if (!data?.content) return null;

  return {
    sha: data.sha,
    content: Buffer.from(data.content, 'base64').toString('utf8'),
  };
}

/** Create or update a file. Pass `sha` when replacing an existing one. */
export async function writeFile({ path, content, message, sha }) {
  return ghFetch(`/repos/${repo()}/contents/${encodeURI(path)}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: branch(),
      ...(sha ? { sha } : {}),
    }),
  });
}

export async function deleteFile({ path, sha, message }) {
  return ghFetch(`/repos/${repo()}/contents/${encodeURI(path)}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: branch() }),
  });
}
