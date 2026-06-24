import { items } from '@/shared/constants/shop-items';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cage3000.com';

// Auto-generated sitemap (Next App Router serves this at /sitemap.xml).
export default function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly' },
    { path: '/shop', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/lookbook', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/projects', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/refund', priority: 0.3, changeFrequency: 'yearly' },
  ].map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));

  const productRoutes = items.map((item) => ({
    url: `${SITE_URL}/shop/${item.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
