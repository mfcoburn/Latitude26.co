import PageHero from '../../components/PageHero';
import Sections from '../../components/Sections';
import ProviderCard from '../../components/ProviderCard';
import CtaBand from '../../components/CtaBand';
import { getPage, getCollection, getSettings } from '../../lib/content';

export async function generateMetadata() {
  const page = await getPage('about');
  return { title: page.title, description: page.seo_description };
}

export default async function AboutPage() {
  const [page, providers, settings] = await Promise.all([
    getPage('about'),
    getCollection('providers'),
    getSettings(),
  ]);

  return (
    <>
      <PageHero hero={page.hero} />

      {providers.length ? (
        <section className="section">
          <div className="shell">
            <div className="section__head">
              <h2>
                {page.providers_section?.heading ??
                  (providers.length === 1 ? 'Your Provider' : 'Your Providers')}
              </h2>
              {page.providers_section?.intro ? (
                <p className="prose" style={{ marginTop: '0.75rem' }}>
                  {page.providers_section.intro}
                </p>
              ) : null}
            </div>

            <div className="grid" style={{ gap: '3rem' }}>
              {providers.map((provider) => (
                <ProviderCard key={provider.slug} provider={provider} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Sections sections={page.sections} />

      <CtaBand cta={page.cta} note={settings.exclusivity_note} />
    </>
  );
}
