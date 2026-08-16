import PageHero from '../../components/PageHero';
import Sections from '../../components/Sections';
import CtaBand from '../../components/CtaBand';
import { getPage, getSettings } from '../../lib/content';

export async function generateMetadata() {
  const page = await getPage('model');
  return { title: page.title, description: page.seo_description };
}

export default async function ModelPage() {
  const [page, settings] = await Promise.all([getPage('model'), getSettings()]);

  return (
    <>
      <PageHero hero={page.hero} />
      <Sections sections={page.sections} />
      <CtaBand
        cta={settings.primary_cta}
        note={settings.exclusivity_note}
      />
    </>
  );
}
