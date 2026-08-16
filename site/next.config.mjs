/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site is unlaunched. Belt-and-braces alongside the `robots` metadata in
  // app/layout.jsx and the Vercel Authentication gate on this project.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
