'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV } from './nav';

export default function SiteHeader({ settings }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/assets/logo-mark.png" alt="" width="34" height="34" />
          <span className="brand__word">
            LATITUDE<span className="accent">26</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <nav
        id="site-nav"
        className="site-nav"
        data-open={open}
        aria-label="Primary"
      >
        <div className="shell">
          <ul>
            {PRIMARY_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={settings?.primary_cta?.href ?? '/contact'}
                aria-current={pathname === '/contact' ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {settings?.primary_cta?.label ?? 'Request an Invitation'}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
