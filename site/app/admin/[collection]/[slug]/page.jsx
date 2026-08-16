import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '../../../../lib/adminSession';
import { getCollectionDef, resolveEntry } from '../../../../lib/schema';
import { readFile } from '../../../../lib/github';
import { parseDocument } from '../../../../lib/document';
import { saveDoc, deleteDoc } from '../../actions';
import DocEditor from '../../../../components/DocEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit', robots: { index: false } };

export default async function EditEntryPage({ params, searchParams }) {
  await requireSession();

  const { collection: name, slug } = await params;
  const query = await searchParams;

  const collection = getCollectionDef(name);
  if (!collection) notFound();

  // resolveEntry validates the slug before it becomes a repository path.
  const entry = resolveEntry(name, slug);
  if (!entry) notFound();

  const stored = await readFile(entry.path);
  if (!stored) notFound();

  const doc = parseDocument(stored.content, entry.fields, collection.format);

  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">
          <Link href={`/admin/${name}`}>{collection.label}</Link>
        </p>
        <h1>{entry.label}</h1>

        {query?.saved ? (
          <p className="form-message">
            Saved. The site rebuilds automatically — allow a minute for the
            change to appear.
          </p>
        ) : null}

        <div style={{ marginTop: '2rem' }}>
          <DocEditor
            fields={entry.fields}
            initialDoc={doc}
            action={saveDoc}
            collection={name}
            slug={slug}
            backHref={`/admin/${name}`}
            deleteAction={collection.kind === 'folder' ? deleteDoc : null}
          />
        </div>
      </div>
    </section>
  );
}
