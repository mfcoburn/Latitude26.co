import { redirect } from 'next/navigation';
import { auth, isAllowedEmail } from '../../../auth';
import PostEditor from '../../../components/PostEditor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'New Post', robots: { index: false } };

export default async function NewPostPage() {
  const session = await auth();
  if (!isAllowedEmail(session?.user?.email)) redirect('/admin/signin');

  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">Content Admin</p>
        <h1>New Post</h1>

        <div style={{ marginTop: '2.5rem' }}>
          <PostEditor authorFallback={session.user.name ?? ''} />
        </div>
      </div>
    </section>
  );
}
