import { items } from '@/shared/constants/shop-items';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cage3000.com';

// Per-product metadata so each product has its own title, description, and
// social-share image. The product page is a client component, so this server
// layout carries the metadata.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = items.find((i) => String(i.id) === String(id));
  if (!item) return { title: 'Shop' };

  const description =
    item.description_ko || item.description || 'CAGE3000 — 서울 기반 made-to-order 밀리너리.';
  const image = item.imageUrl ? `${SITE_URL}${item.imageUrl}` : undefined;
  const url = `${SITE_URL}/shop/${item.id}`;

  return {
    // `absolute` so the brand suffix is guaranteed (nested layout doesn't inherit
    // the root title template).
    title: { absolute: `${item.name} — Headwear · CAGE3000` },
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `CAGE3000 ${item.name}`,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image, alt: `CAGE3000 ${item.name}` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `CAGE3000 ${item.name}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function ShopItemLayout({ children }) {
  return children;
}
