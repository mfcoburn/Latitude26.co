import { notFound } from 'next/navigation';
import PageHero from '../../../components/PageHero';
import { getLegalPage } from '../../../lib/content';
import { LEGAL_NAV } from '../../../components/nav';

const SLUGS = LEGAL_NAV.map((item) => item.href.replace('/legal/', ''));

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!SLUGS.includes(slug)) return {};
  const page = await getLegalPage(slug);
  return { title: page.title };
}

export default async function LegalPage({ params }) {
  const { slug } = await params;
  if (!SLUGS.includes(slug)) notFound();

  const page = await getLegalPage(slug);

  return (
    <>
      <PageHero hero={{ headline: page.title }} />

      <section className="section">
        <div className="shell">
          {page.status === 'pending-legal-review' ? (
            <p className="placeholder-flag">Content pending legal review</p>
          ) : null}

          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
          />
        </div>
      </section>
    </>
  );
}
