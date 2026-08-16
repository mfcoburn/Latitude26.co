import PageHero from '../../components/PageHero';
import Sections from '../../components/Sections';
import CtaBand from '../../components/CtaBand';
import { getPage, getSettings } from '../../lib/content';

export async function generateMetadata() {
  const page = await getPage('membership');
  return { title: page.title, description: page.seo_description };
}

export default async function MembershipPage() {
  const [page, settings] = await Promise.all([
    getPage('membership'),
    getSettings(),
  ]);

  return (
    <>
      <PageHero hero={page.hero} coordinate={settings.exclusivity_note} />

      <Sections sections={page.sections} />

      {(page.included || page.add_ons) && (
        <section className="section">
          <div className="shell">
            <div className="grid grid--2">
              {page.included ? (
                <div>
                  <h3>{page.included.heading}</h3>
                  <ul className="tick-list" style={{ marginTop: '1.25rem' }}>
                    {page.included.items?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {page.add_ons ? (
                <div>
                  <h3>{page.add_ons.heading}</h3>
                  <ul className="tick-list" style={{ marginTop: '1.25rem' }}>
                    {page.add_ons.items?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {page.inquiry_flow ? (
        <section className="section">
          <div className="shell">
            <div className="section__head">
              <h2>{page.inquiry_flow.heading}</h2>
            </div>
            <ol className="step-list">
              {page.inquiry_flow.steps?.map((step) => (
                <li key={step.title}>
                  <h3>{step.title}</h3>
                  <p className="prose">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      <CtaBand cta={page.cta} note={settings.exclusivity_note} />
    </>
  );
}
