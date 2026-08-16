import PageHero from '../../components/PageHero';
import CtaBand from '../../components/CtaBand';
import { getPage, getCollection, getSettings } from '../../lib/content';

export async function generateMetadata() {
  const page = await getPage('services');
  return { title: page.title, description: page.seo_description };
}

export default async function ServicesPage() {
  const [page, services, settings] = await Promise.all([
    getPage('services'),
    getCollection('services'),
    getSettings(),
  ]);

  return (
    <>
      <PageHero hero={page.hero} />

      {services.map((service, index) => (
        <section className="section" key={service.slug}>
          <div className="shell">
            <div className="section__head">
              <span className="card__index">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2>{service.title}</h2>
            </div>

            {service.summary ? <p className="lede">{service.summary}</p> : null}

            {service.bodyHtml ? (
              <div
                className="prose"
                style={{ marginTop: '1.25rem' }}
                dangerouslySetInnerHTML={{ __html: service.bodyHtml }}
              />
            ) : null}

            {service.highlights?.length ? (
              <ul className="tick-list" style={{ marginTop: '1.5rem' }}>
                {service.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}

      <CtaBand cta={page.cta} note={settings.exclusivity_note} />
    </>
  );
}
