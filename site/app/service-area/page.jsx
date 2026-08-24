import PageHero from '../../components/PageHero';
import Sections from '../../components/Sections';
import CtaBand from '../../components/CtaBand';
import { getPage, getSettings } from '../../lib/content';

export async function generateMetadata() {
  const page = await getPage('service-area');
  return { title: page.title, description: page.seo_description };
}

export default async function ServiceAreaPage() {
  const [page, settings] = await Promise.all([
    getPage('service-area'),
    getSettings(),
  ]);

  return (
    <>
      <PageHero
        hero={page.hero}
        coordinate={settings.locations?.join(' · ')}
      />

      {page.areas?.length ? (
        <section className="section">
          <div className="shell">
            <div className="grid grid--3">
              {page.areas.map((area) => (
                <article className="card" key={area.name}>
                  <h3>{area.name}</h3>
                  <p>{area.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Sections sections={page.sections} className="section--justified" />

      <CtaBand cta={page.cta} note={settings.exclusivity_note} />
    </>
  );
}
