// Blocks indexing while the site is behind the gate.
// TODO(launch): relax this to `allow: '/'` when the site goes live.
export default function robots() {
  return {
    rules: [{ userAgent: '*', disallow: '/' }],
  };
}
