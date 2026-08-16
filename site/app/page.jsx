import PageHero from '../components/PageHero';
import CtaBand from '../components/CtaBand';
import { getPage, getSettings } from '../lib/content';

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPage('home'), getSettings()]);

  return (
    <>
      <PageHero hero={page.hero} coordinate={settings.coordinate_mark} showMark />

      {page.value_proposition ? (
        <section className="section">
          <div className="shell">
            <div className="section__head">
              <h2>{page.value_proposition.heading}</h2>
            </div>
            <p className="prose">{page.value_proposition.body}</p>
          </div>
        </section>
      ) : null}

      {page.pillars?.length ? (
        <section className="section">
          <div className="shell">
            <div className="grid grid--3">
              {page.pillars.map((pillar, index) => (
                <article className="card" key={pillar.title}>
                  <span className="card__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.bodyHtml ? (
        <section className="section">
          <div className="shell">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
            />
          </div>
        </section>
      ) : null}

      <CtaBand cta={page.cta} note={settings.exclusivity_note} />
    </>
  );
}
