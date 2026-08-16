import { notFound, redirect } from 'next/navigation';
import { auth, isAllowedEmail } from '../../../../auth';
import PostEditor from '../../../../components/PostEditor';
import { readFile, BLOG_PATH } from '../../../../lib/github';
import { parsePostMarkdown } from '../../../../lib/postFile';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Edit Post', robots: { index: false } };

export default async function EditPostPage({ params }) {
  const session = await auth();
  if (!isAllowedEmail(session?.user?.email)) redirect('/admin/signin');

  const { slug } = await params;

  // Guard against traversal — the slug becomes a repository path.
  if (!/^[a-z0-9-]+$/i.test(slug)) notFound();

  const stored = await readFile(`${BLOG_PATH}/${slug}.md`);
  if (!stored) notFound();

  const post = parsePostMarkdown(stored.content);

  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">Content Admin</p>
        <h1>Edit Post</h1>

        <div style={{ marginTop: '2.5rem' }}>
          <PostEditor post={post} slug={slug} />
        </div>
      </div>
    </section>
  );
}
