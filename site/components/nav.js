// Single source of truth for site navigation. Adding a page here links it in
// the header and the footer at once.
export const PRIMARY_NAV = [
  { href: '/', label: 'Home' },
  { href: '/the-model', label: 'The Model' },
  { href: '/services', label: 'Services' },
  { href: '/membership', label: 'Membership' },
  { href: '/about', label: 'About' },
  { href: '/service-area', label: 'Service Area' },
  { href: '/blog', label: 'Journal' },
];

// This list drives both the footer "Notices" links and the /legal/<slug>
// routes (generateStaticParams reads it). The Medical Disclaimer and
// Non-Discrimination pages are kept as files in content/legal/ but delinked
// for now; re-add their entries here to relink and re-route them.
export const LEGAL_NAV = [
  { href: '/legal/privacy', label: 'Privacy Policy' },
  { href: '/legal/terms', label: 'Terms of Use' },
  { href: '/legal/hipaa-notice', label: 'HIPAA Notice' },
];
