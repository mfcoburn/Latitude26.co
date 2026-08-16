import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '../../../../lib/adminSession';
import { getCollectionDef } from '../../../../lib/schema';
import { emptyDocument } from '../../../../lib/document';
import { saveDoc } from '../../actions';
import DocEditor from '../../../../components/DocEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New Entry', robots: { index: false } };

export default async function NewEntryPage({ params }) {
  const session = await requireSession();

  const { collection: name } = await params;
  const collection = getCollectionDef(name);

  // Only folder collections can gain new entries.
  if (!collection || collection.kind !== 'folder') notFound();

  const doc = {
    ...emptyDocument(collection.fields),
    ...(collection.newDefaults ?? {}),
  };

  // Sensible starting values so the form is usable immediately.
  if ('date' in doc && !doc.date) doc.date = new Date().toISOString().slice(0, 10);
  if ('author' in doc && !doc.author) doc.author = session.user.name ?? '';

  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">
          <Link href={`/admin/${name}`}>{collection.label}</Link>
        </p>
        <h1>New Entry</h1>

        <div style={{ marginTop: '2rem' }}>
          <DocEditor
            fields={collection.fields}
            initialDoc={doc}
            action={saveDoc}
            collection={name}
            slug=""
            isNew
            backHref={`/admin/${name}`}
          />
        </div>
      </div>
    </section>
  );
}
