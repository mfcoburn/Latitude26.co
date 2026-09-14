import './globals.css';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import { getSettings } from '../lib/content';

export async function generateMetadata() {
  const settings = await getSettings();
  return {
    title: {
      default: `${settings.practice_name} | ${settings.tagline}`,
      template: `%s | ${settings.practice_name}`,
    },
    description: settings.tagline,
    icons: {
      icon: '/assets/favicon-32.png',
      apple: '/assets/apple-touch-icon.png',
    },
    // Site is live. Allow search engines to index and follow.
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }) {
  const settings = await getSettings();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Montserrat:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="graticule" aria-hidden="true" />
        <SiteHeader settings={settings} />
        <main className="site-main">{children}</main>
        <SiteFooter settings={settings} />
      </body>
    </html>
  );
}
