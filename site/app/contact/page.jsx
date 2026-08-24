import PageHero from '../../components/PageHero';
import Sections from '../../components/Sections';
import InquiryForm from '../../components/InquiryForm';
import { getPage, getSettings } from '../../lib/content';

export async function generateMetadata() {
  const page = await getPage('contact');
  return { title: page.title, description: page.seo_description };
}

export default async function ContactPage() {
  const [page, settings] = await Promise.all([
    getPage('contact'),
    getSettings(),
  ]);

  return (
    <>
      <PageHero hero={page.hero} coordinate={settings.exclusivity_note} />

      <section className="section">
        <div className="shell">
          <InquiryForm copy={page.form} />

          {page.form?.privacy_note ? (
            <p className="form-note" style={{ marginTop: '1.5rem' }}>
              {page.form.privacy_note}
            </p>
          ) : null}

          {settings.contact?.email || settings.contact?.phone ? (
            <p className="form-note" style={{ marginTop: '1rem' }}>
              Or reach us directly
              {settings.contact.phone ? (
                <>
                  {' '}on{' '}
                  <a href={`tel:${settings.contact.phone.replace(/[^+\d]/g, '')}`}>
                    {settings.contact.phone}
                  </a>
                </>
              ) : null}
              {settings.contact.email ? (
                <>
                  {settings.contact.phone ? ' or at ' : ' at '}
                  <a href={`mailto:${settings.contact.email}`}>
                    {settings.contact.email}
                  </a>
                </>
              ) : null}
              .
            </p>
          ) : null}
        </div>
      </section>

      <Sections sections={page.sections} className="section--justified" />
    </>
  );
}
