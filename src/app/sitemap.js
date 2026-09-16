import { items } from '@/shared/constants/shop-items';
import { PROJECT1_ITEMS } from '@/shared/constants/project1-images';
import { SITE_URL, absoluteUrl } from '@/lib/seo';

// Auto-generated sitemap (Next App Router serves this at /sitemap.xml).
// Image entries let Google/Naver image search index product and project shots.
export default function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'weekly', images: ['/asset/details/lookbook/9hat/A3.jpeg'] },
    { path: '/shop', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/lookbook', priority: 0.7, changeFrequency: 'monthly' },
    {
      path: '/projects',
      priority: 0.7,
      changeFrequency: 'monthly',
      images: PROJECT1_ITEMS.flatMap((project) => project.subImages),
    },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly', images: ['/about_profile.png'] },
    { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/refund', priority: 0.3, changeFrequency: 'yearly' },
  ].map(({ path, priority, changeFrequency, images = [] }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
    images: images.map(absoluteUrl),
  }));

  const projectRoutes = PROJECT1_ITEMS.map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.7,
    images: (project.subImages?.length ? project.subImages : [project.image]).map(absoluteUrl),
  }));

  const productRoutes = items.map((item) => ({
    url: `${SITE_URL}/shop/${item.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
    images: (item.images?.length ? item.images : [item.imageUrl]).map(absoluteUrl),
  }));

  return [...staticRoutes, ...projectRoutes, ...productRoutes];
}
