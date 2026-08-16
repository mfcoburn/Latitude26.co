import Link from 'next/link';
import PageHero from '../../components/PageHero';
import CtaBand from '../../components/CtaBand';
import { getPage, getPosts, getSettings, formatPostDate } from '../../lib/content';

export async function generateMetadata() {
  const page = await getPage('blog');
  return { title: page.title, description: page.seo_description };
}

export default async function BlogIndexPage() {
  const [page, posts, settings] = await Promise.all([
    getPage('blog'),
    getPosts(),
    getSettings(),
  ]);

  return (
    <>
      <PageHero hero={page.hero} />

      <section className="section">
        <div className="shell">
          {posts.length ? (
            <ul className="post-list">
              {posts.map((post) => (
                <li key={post.slug}>
                  <article>
                    <p className="post-meta">
                      <time dateTime={new Date(post.date).toISOString()}>
                        {formatPostDate(post.date)}
                      </time>
                      {post.author ? <span> · {post.author}</span> : null}
                    </p>

                    <h2>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {post.excerpt ? (
                      <p className="prose">{post.excerpt}</p>
                    ) : null}

                    <Link className="post-more" href={`/blog/${post.slug}`}>
                      Read
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <p className="prose">{page.empty_message}</p>
          )}
        </div>
      </section>

      <CtaBand cta={settings.primary_cta} note={settings.exclusivity_note} />
    </>
  );
}
