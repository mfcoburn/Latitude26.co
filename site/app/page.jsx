import Link from 'next/link';
import PageHero from '../components/PageHero';
import { getPage, getSettings } from '../lib/content';

export default async function HomePage() {
  const [page, settings] = await Promise.all([getPage('home'), getSettings()]);

  return (
    <>
      <PageHero
        hero={page.hero}
        coordinate={settings.coordinate_mark}
        showMark
        actions={page.hero?.actions}
      />

      {page.problem ? (
        <section className="section section--center">
          <div className="shell">
            <h2 className="statement">{page.problem.heading}</h2>
            <p className="prose" style={{ marginTop: '1.5rem' }}>
              {page.problem.body}
            </p>
          </div>
        </section>
      ) : null}

      {page.difference ? (
        <section className="section">
          <div className="shell">
            <div className="section__head section__head--center">
              <h2>{page.difference.heading}</h2>
            </div>

            <div className="grid grid--2">
              {page.difference.items?.map((item, index) => (
                <article className="card" key={item.title}>
                  <span className="card__index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.membership ? (
        <section className="section">
          <div className="shell">
            <div className="section__head">
              <h2>{page.membership.heading}</h2>
            </div>

            <p className="lede">{page.membership.intro}</p>

            <ul className="tick-list" style={{ margin: '1.75rem 0 2rem' }}>
              {page.membership.items?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            {page.membership.cta?.label ? (
              <Link className="btn btn--ghost" href={page.membership.cta.href}>
                {page.membership.cta.label}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      {page.beyond ? (
        <section className="section">
          <div className="shell">
            <div className="section__head">
              <h2>{page.beyond.heading}</h2>
            </div>

            <p className="prose" style={{ marginBottom: '2rem' }}>
              {page.beyond.intro}
            </p>

            <div className="grid grid--3">
              {page.beyond.items?.map((item) => (
                <article className="card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {page.closing ? (
        <section className="cta-band">
          <div className="shell">
            <h2>{page.closing.heading}</h2>

            <p className="prose" style={{ margin: '1.25rem auto 2rem' }}>
              {page.closing.body}
            </p>

            <div className="cta-band__actions">
              {page.closing.cta?.label ? (
                <Link className="btn" href={page.closing.cta.href}>
                  {page.closing.cta.label}
                </Link>
              ) : null}

              {settings.contact?.phone ? (
                <a
                  className="btn btn--ghost"
                  href={`tel:${settings.contact.phone.replace(/[^+\d]/g, '')}`}
                >
                  {settings.contact.phone}
                </a>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
