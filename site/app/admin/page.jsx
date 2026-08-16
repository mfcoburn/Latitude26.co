import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut, isAllowedEmail } from '../../auth';
import { listPostFiles, readFile, BLOG_PATH } from '../../lib/github';
import { parsePostMarkdown } from '../../lib/postFile';
import { formatPostDate } from '../../lib/content';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Journal Admin', robots: { index: false } };

async function loadPosts() {
  const files = await listPostFiles();

  const posts = await Promise.all(
    files.map(async (file) => {
      const stored = await readFile(`${BLOG_PATH}/${file.name}`);
      const parsed = stored ? parsePostMarkdown(stored.content) : null;
      return { slug: file.name.replace(/\.md$/, ''), ...parsed };
    })
  );

  return posts.sort((a, b) => new Date(b.date ?? 0) - new Date(a.date ?? 0));
}

export default async function AdminHome({ searchParams }) {
  const session = await auth();
  if (!isAllowedEmail(session?.user?.email)) redirect('/admin/signin');

  const params = await searchParams;

  let posts = [];
  let loadError = null;
  try {
    posts = await loadPosts();
  } catch (error) {
    loadError = error.message;
  }

  return (
    <section className="section">
      <div className="shell">
        <div className="admin-head">
          <div>
            <p className="eyebrow">Content Admin</p>
            <h1>Journal</h1>
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

        {params?.saved ? (
          <p className="form-message">
            Saved. The site rebuilds automatically — allow a minute for the
            change to appear.
          </p>
        ) : null}

        {params?.deleted ? <p className="form-message">Post deleted.</p> : null}

        <p style={{ margin: '2rem 0' }}>
          <Link className="btn" href="/admin/new">
            New Post
          </Link>
        </p>

        {loadError ? (
          <p className="form-message error">
            Could not load posts: {loadError}
          </p>
        ) : posts.length === 0 ? (
          <p className="prose">No posts yet.</p>
        ) : (
          <ul className="admin-list">
            {posts.map((post) => (
              <li key={post.slug}>
                <div>
                  <h3>
                    <Link href={`/admin/edit/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="post-meta">
                    {formatPostDate(post.date)}
                    {post.author ? ` · ${post.author}` : ''}
                    {post.draft ? ' · Draft' : ''}
                  </p>
                </div>

                <Link className="btn btn--ghost" href={`/admin/edit/${post.slug}`}>
                  Edit
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
