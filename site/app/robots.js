// Site is live. Allow search engines to crawl everything.
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
  };
}
