import { SITE_URL } from '@/lib/seo';

// Auto-generated robots.txt (Next App Router serves this at /robots.txt).
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private / transactional areas — keep out of the index.
      disallow: ['/admin', '/api', '/my-page', '/checkout', '/cart', '/auth', '/order-lookup'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
