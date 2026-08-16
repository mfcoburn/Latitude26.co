import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireSession } from '../../../lib/adminSession';
import { getCollectionDef, resolveEntry } from '../../../lib/schema';
import { listFolderFiles, readFile } from '../../../lib/github';
import { parseDocument } from '../../../lib/document';
import { saveDoc } from '../actions';
import DocEditor from '../../../components/DocEditor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { collection } = await params;
  const def = getCollectionDef(collection);
  return { title: def?.label ?? 'Admin', robots: { index: false } };
}

export default async function CollectionPage({ params, searchParams }) {
  await requireSession();

  const { collection: name } = await params;
  const query = await searchParams;
  const collection = getCollectionDef(name);
  if (!collection) notFound();

  // Singletons open straight into the editor — there is nothing to list.
  if (collection.kind === 'single') {
    const entry = resolveEntry(name, null);
    const stored = await readFile(entry.path);

    if (!stored) {
      return (
        <Shell title={collection.label}>
          <p className="form-message error">
            {entry.path} is missing from the repository.
          </p>
        </Shell>
      );
    }

    return (
      <Shell title={collection.label} saved={query?.saved}>
        <DocEditor
          fields={entry.fields}
          initialDoc={parseDocument(stored.content, entry.fields, collection.format)}
          action={saveDoc}
          collection={name}
          slug=""
          backHref="/admin"
        />
      </Shell>
    );
  }

  let rows = [];
  let loadError = null;

  try {
    if (collection.kind === 'files') {
      rows = Object.entries(collection.entries).map(([slug, entry]) => ({
        slug,
        label: entry.label,
      }));
    } else {
      const files = await listFolderFiles(collection.path);

      rows = await Promise.all(
        files.map(async (file) => {
          const slug = file.name.replace(/\.md$/, '');
          const stored = await readFile(file.path);
          const doc = stored
            ? parseDocument(stored.content, collection.fields, collection.format)
            : {};

          return {
            slug,
            label: doc[collection.titleField] || slug,
            meta: [
              collection.sortBy === 'date' ? doc.date : null,
              doc.draft ? 'Draft' : null,
              collection.sortBy === 'order' ? `Order ${doc.order ?? '—'}` : null,
            ]
              .filter(Boolean)
              .join(' · '),
            sortKey: doc[collection.sortBy],
          };
        })
      );

      rows.sort((a, b) =>
        collection.sortBy === 'date'
          ? new Date(b.sortKey ?? 0) - new Date(a.sortKey ?? 0)
          : (a.sortKey ?? 999) - (b.sortKey ?? 999)
      );
    }
  } catch (error) {
    loadError = error.message;
  }

  return (
    <Shell title={collection.label} saved={query?.saved} deleted={query?.deleted}>
      <p className="prose">{collection.description}</p>

      {collection.kind === 'folder' ? (
        <p style={{ margin: '2rem 0' }}>
          <Link className="btn" href={`/admin/${name}/new`}>
            New Entry
          </Link>
        </p>
      ) : null}

      {loadError ? (
        <p className="form-message error">Could not load entries: {loadError}</p>
      ) : rows.length === 0 ? (
        <p className="prose">Nothing here yet.</p>
      ) : (
        <ul className="admin-list">
          {rows.map((row) => (
            <li key={row.slug}>
              <div>
                <h3>
                  <Link href={`/admin/${name}/${row.slug}`}>{row.label}</Link>
                </h3>
                {row.meta ? <p className="post-meta">{row.meta}</p> : null}
              </div>

              <Link className="btn btn--ghost" href={`/admin/${name}/${row.slug}`}>
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}

function Shell({ title, children, saved, deleted }) {
  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">
          <Link href="/admin">Content Admin</Link>
        </p>
        <h1>{title}</h1>

        {saved ? <p className="form-message">Saved. The site rebuilds automatically.</p> : null}
        {deleted ? <p className="form-message">Entry deleted.</p> : null}

        <div style={{ marginTop: '2rem' }}>{children}</div>
      </div>
    </section>
  );
}
