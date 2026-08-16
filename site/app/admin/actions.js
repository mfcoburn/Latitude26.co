'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, isAllowedEmail } from '../../auth';
import { BLOG_PATH, readFile, writeFile, deleteFile } from '../../lib/github';
import { buildPostMarkdown, slugify } from '../../lib/postFile';

/**
 * Re-checks the signed-in user against the allowlist on every write, so
 * revoking access takes effect immediately rather than at session expiry.
 */
async function requireEditor() {
  const session = await auth();
  const email = session?.user?.email;

  if (!isAllowedEmail(email)) {
    throw new Error('Not authorised.');
  }

  return { email, name: session.user.name ?? email };
}

function fieldsFromForm(formData) {
  return {
    title: (formData.get('title') ?? '').toString().trim(),
    date: (formData.get('date') ?? '').toString().trim(),
    author: (formData.get('author') ?? '').toString().trim(),
    excerpt: (formData.get('excerpt') ?? '').toString().trim(),
    cover: (formData.get('cover') ?? '').toString().trim(),
    draft: formData.get('draft') === 'on',
    body: (formData.get('body') ?? '').toString(),
  };
}

export async function savePost(formData) {
  const editor = await requireEditor();
  const fields = fieldsFromForm(formData);

  if (!fields.title) throw new Error('A title is required.');
  if (!fields.date) throw new Error('A date is required.');

  // On edit the original filename is preserved so published URLs never break.
  const existingSlug = (formData.get('slug') ?? '').toString().trim();
  const slug = existingSlug || slugify(fields.title);

  if (!slug) throw new Error('Could not derive a filename from that title.');

  const path = `${BLOG_PATH}/${slug}.md`;
  const existing = existingSlug ? await readFile(path) : null;

  if (!existingSlug && (await readFile(path))) {
    throw new Error(`A post with the slug "${slug}" already exists.`);
  }

  await writeFile({
    path,
    content: buildPostMarkdown(fields),
    sha: existing?.sha,
    message: `${existingSlug ? 'Update' : 'Add'} journal post: ${fields.title}\n\nEdited via the admin by ${editor.name}.`,
  });

  revalidatePath('/admin');
  revalidatePath('/blog');
  redirect('/admin?saved=1');
}

export async function removePost(formData) {
  const editor = await requireEditor();
  const slug = (formData.get('slug') ?? '').toString().trim();
  if (!slug) throw new Error('Missing post.');

  const path = `${BLOG_PATH}/${slug}.md`;
  const existing = await readFile(path);
  if (!existing) throw new Error('That post no longer exists.');

  await deleteFile({
    path,
    sha: existing.sha,
    message: `Delete journal post: ${slug}\n\nDeleted via the admin by ${editor.name}.`,
  });

  revalidatePath('/admin');
  revalidatePath('/blog');
  redirect('/admin?deleted=1');
}
