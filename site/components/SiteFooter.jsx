import Link from 'next/link';
import { PRIMARY_NAV, LEGAL_NAV } from './nav';

export default function SiteFooter({ settings }) {
  const year = new Date().getFullYear();
  const locations = settings?.locations ?? [];

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer__grid">
          <div>
            <h4>{settings?.practice_name}</h4>
            <p className="cities">{locations.join(' · ')}</p>
            {settings?.contact?.email ? (
              <p style={{ marginTop: '1rem' }}>
                <a href={`mailto:${settings.contact.email}`}>
                  {settings.contact.email}
                </a>
              </p>
            ) : null}

            {settings?.contact?.phone ? (
              <p style={{ marginTop: '0.25rem' }}>
                <a href={`tel:${settings.contact.phone.replace(/[^+\d]/g, '')}`}>
                  {settings.contact.phone}
                </a>
              </p>
            ) : null}
          </div>

          <div>
            <h4>Practice</h4>
            <ul>
              {PRIMARY_NAV.filter((i) => i.href !== '/').map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Notices</h4>
            <ul>
              {LEGAL_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="colophon">
          © {year} {settings?.legal_entity ?? 'Latitude 26 Medical LLC'}. All
          rights reserved. This site is for general information only and does
          not constitute medical advice.
        </p>
      </div>
    </footer>
  );
}
