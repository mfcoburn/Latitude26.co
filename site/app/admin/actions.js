'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth, isAllowedEmail } from '../../auth';
import { readFile, writeFile, deleteFile } from '../../lib/github';
import { getCollectionDef, resolveEntry } from '../../lib/schema';
import { serializeDocument, validateDocument } from '../../lib/document';
import { slugify } from '../../lib/postFile';

/**
 * Re-checks the signed-in user against the allowlist on every write, so
 * revoking access takes effect immediately rather than at session expiry.
 */
async function requireEditor() {
  const session = await auth();
  const email = session?.user?.email;

  if (!isAllowedEmail(email)) throw new Error('Not authorised.');

  return { email, name: session.user.name ?? email };
}

export async function saveDoc(formData) {
  let destination;

  try {
    const editor = await requireEditor();

    const collectionName = (formData.get('collection') ?? '').toString();
    const collection = getCollectionDef(collectionName);
    if (!collection) return { error: 'Unknown collection.' };

    const isNew = Boolean((formData.get('isNew') ?? '').toString());
    let slug = (formData.get('slug') ?? '').toString().trim();

    let doc;
    try {
      doc = JSON.parse((formData.get('doc') ?? '{}').toString());
    } catch {
      return { error: 'The submitted content could not be read.' };
    }

    const fields =
      collection.kind === 'folder'
        ? collection.fields
        : resolveEntry(collectionName, slug)?.fields;

    if (!fields) return { error: 'Unknown entry.' };

    const errors = validateDocument(doc, fields);
    if (errors.length) return { error: errors.join(' ') };

    // New folder entries derive their filename from the title field once.
    // Existing entries keep theirs, so published URLs never break.
    if (collection.kind === 'folder' && isNew) {
      slug = slugify(doc[collection.titleField]);
      if (!slug) return { error: 'Could not derive a filename from that title.' };
    }

    const entry = resolveEntry(collectionName, slug);
    if (!entry) return { error: 'Unknown entry.' };

    const existing = await readFile(entry.path);

    if (collection.kind === 'folder' && isNew && existing) {
      return { error: `An entry named "${slug}" already exists.` };
    }

    if (collection.kind !== 'folder' && !existing) {
      return { error: 'That file is missing from the repository.' };
    }

    await writeFile({
      path: entry.path,
      content: serializeDocument(doc, fields, collection.format),
      sha: existing?.sha,
      message: `${isNew ? 'Add' : 'Update'} ${collectionName}: ${slug || collectionName}\n\nEdited via the admin by ${editor.name}.`,
    });

    revalidatePath('/', 'layout');

    destination =
      collection.kind === 'single'
        ? `/admin/${collectionName}?saved=1`
        : `/admin/${collectionName}/${slug}?saved=1`;
  } catch (error) {
    return { error: error.message ?? 'Something went wrong.' };
  }

  redirect(destination);
}

export async function deleteDoc(formData) {
  let destination;

  try {
    const editor = await requireEditor();

    const collectionName = (formData.get('collection') ?? '').toString();
    const collection = getCollectionDef(collectionName);

    // Only folder collections may be deleted — the fixed pages, settings and
    // legal notices are part of the site's structure.
    if (!collection || collection.kind !== 'folder') {
      return { error: 'This entry cannot be deleted.' };
    }

    const slug = (formData.get('slug') ?? '').toString().trim();
    const entry = resolveEntry(collectionName, slug);
    if (!entry) return { error: 'Unknown entry.' };

    const existing = await readFile(entry.path);
    if (!existing) return { error: 'That entry no longer exists.' };

    await deleteFile({
      path: entry.path,
      sha: existing.sha,
      message: `Delete ${collectionName}: ${slug}\n\nDeleted via the admin by ${editor.name}.`,
    });

    revalidatePath('/', 'layout');
    destination = `/admin/${collectionName}?deleted=1`;
  } catch (error) {
    return { error: error.message ?? 'Something went wrong.' };
  }

  redirect(destination);
}
