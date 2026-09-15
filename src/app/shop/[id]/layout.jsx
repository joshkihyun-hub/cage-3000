import { isPricePublic, items } from '@/shared/constants/shop-items';
import { OPEN_GRAPH_BASE, SITE_NAME, SITE_URL, absoluteUrl, toJsonLd } from '@/lib/seo';

function findItem(id) {
  return items.find((i) => String(i.id) === String(id));
}

// Per-product metadata so each product has its own title and description. The
// share image comes from ./opengraph-image.jsx, so openGraph here deliberately
// has no `images` key — setting one would override the generated card.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = findItem(id);
  if (!item) return { title: 'Shop' };

  const description =
    item.description_ko || item.description || 'CAGE3000 — 서울 기반 made-to-order 밀리너리.';
  const url = `${SITE_URL}/shop/${item.id}`;

  return {
    // `absolute` so the brand suffix is guaranteed (nested layout doesn't inherit
    // the root title template).
    title: { absolute: `${item.name} — Headwear · CAGE3000` },
    description,
    alternates: { canonical: url },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      title: `CAGE3000 ${item.name}`,
      description,
      url,
    },
  };
}

// Structured data for Google: breadcrumbs for every product, plus a Product
// rich result (image + price) only where the price is shown on the page —
// Google requires the marked-up price to match what visitors see.
function productJsonLd(item) {
  const url = `${SITE_URL}/shop/${item.id}`;
  const name = `CAGE3000 ${item.name}`;
  const graph = [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
        { '@type': 'ListItem', position: 3, name, item: url },
      ],
    },
  ];

  if (isPricePublic(item)) {
    graph.push({
      '@type': 'Product',
      name,
      url,
      image: (item.images?.length ? item.images : [item.imageUrl]).map(absoluteUrl),
      description: item.description_ko || item.description,
      brand: { '@type': 'Brand', name: SITE_NAME },
      offers: {
        '@type': 'Offer',
        url,
        price: item.priceNum,
        priceCurrency: 'KRW',
        availability: 'https://schema.org/MadeToOrder',
        seller: { '@id': `${SITE_URL}/#organization` },
      },
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

export default async function ShopItemLayout({ children, params }) {
  const { id } = await params;
  const item = findItem(id);

  return (
    <>
      {item && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(productJsonLd(item)) }}
        />
      )}
      {children}
    </>
  );
}
