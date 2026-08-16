import Link from 'next/link';
import { signOut } from '../../auth';
import { requireSession } from '../../lib/adminSession';
import { COLLECTIONS } from '../../lib/schema';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Content Admin', robots: { index: false } };

export default async function AdminHome() {
  const session = await requireSession();

  return (
    <section className="section">
      <div className="shell">
        <div className="admin-head">
          <div>
            <p className="eyebrow">Content Admin</p>
            <h1>Everything you can edit</h1>
          </div>

          <div className="admin-identity">
            <span>{session.user.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/admin/signin' });
              }}
            >
              <button className="btn btn--ghost" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid--2" style={{ marginTop: '2rem' }}>
          {Object.entries(COLLECTIONS).map(([name, collection]) => (
            <article className="card" key={name}>
              <h3>
                <Link href={`/admin/${name}`}>{collection.label}</Link>
              </h3>
              <p>{collection.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
