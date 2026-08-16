import Link from 'next/link';
import { notFound } from 'next/navigation';
import CtaBand from '../../../components/CtaBand';
import { getPost, getPosts, getSettings, formatPostDate } from '../../../lib/content';

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSettings()]);

  if (!post) notFound();

  return (
    <>
      <article>
        <header className="hero">
          <div className="shell">
            <p className="eyebrow">
              <time dateTime={new Date(post.date).toISOString()}>
                {formatPostDate(post.date)}
              </time>
              {post.author ? ` · ${post.author}` : ''}
            </p>

            <h1>{post.title}</h1>

            <div className="mark-rule" aria-hidden="true">
              <span />
              <span />
            </div>

            {post.excerpt ? <p className="lede">{post.excerpt}</p> : null}
          </div>
        </header>

        {post.cover ? (
          <div className="shell">
            <img className="post-cover" src={post.cover} alt="" />
          </div>
        ) : null}

        <div className="section">
          <div className="shell">
            <div
              className="prose post-body"
              dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
            />

            <p style={{ marginTop: '3rem' }}>
              <Link className="btn btn--ghost" href="/blog">
                All Writing
              </Link>
            </p>
          </div>
        </div>
      </article>

      <CtaBand cta={settings.primary_cta} note={settings.exclusivity_note} />
    </>
  );
}
