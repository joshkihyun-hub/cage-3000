import { items } from '@/shared/constants/shop-items';
import { OPEN_GRAPH_BASE, SITE_NAME, SITE_URL, absoluteUrl, toJsonLd } from '@/lib/seo';

function findItem(id) {
  return items.find((i) => String(i.id) === String(id));
}

// 상품은 고정 목록이라 빌드 때 전부 정적 페이지로 만든다. 요청마다 서버에서 그리면
// 상품을 누를 때마다 서버를 한 번 다녀와서(실측 330ms) 이동이 한 박자 늦는다 —
// 정적이면 링크가 보일 때 통째로 미리 받아 두어 바로 열린다.
// 목록에 없는 번호는 렌더링 없이 404(오타 주소가 200으로 열리면 검색엔진이 수집한다).
export const dynamicParams = false;

export function generateStaticParams() {
  return items.map((item) => ({ id: String(item.id) }));
}

// Per-product metadata. 상품 페이지에는 description을 두지 않는다 — 카카오톡·인스타
// 공유 카드에 상품 설명문이 딸려 나오는 걸 원치 않아서다. Next는 openGraph.description을
// 비워도 페이지 description을 그대로 승계하므로, 없애려면 둘 다 없어야 한다.
// 공유 이미지는 ./opengraph-image.jsx가 만들므로 openGraph에 `images` 키를 넣지 않는다.
export async function generateMetadata({ params }) {
  const { id } = await params;
  const item = findItem(id);
  if (!item) return { title: 'Shop' };

  const url = `${SITE_URL}/shop/${item.id}`;

  return {
    // `absolute` so the brand suffix is guaranteed (nested layout doesn't inherit
    // the root title template).
    title: { absolute: `${item.name} · CAGE3000` },
    // null이어야 루트 레이아웃의 브랜드 설명문까지 상속되지 않는다.
    description: null,
    alternates: { canonical: url },
    openGraph: {
      ...OPEN_GRAPH_BASE,
      title: `CAGE3000 ${item.name}`,
      url,
    },
  };
}

// Structured data: breadcrumbs plus a Product rich result (image + price) so
// Google can show the price in search. 가격은 상품 페이지에 그대로 보이는 값이어야
// 하므로 priceNum과 화면 표시(item.price)는 항상 같이 움직여야 한다.
function productJsonLd(item) {
  const url = `${SITE_URL}/shop/${item.id}`;
  const name = `CAGE3000 ${item.name}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
          { '@type': 'ListItem', position: 3, name, item: url },
        ],
      },
      {
        '@type': 'Product',
        name,
        url,
        image: (item.images?.length ? item.images : [item.imageUrl]).map(absoluteUrl),
        brand: { '@type': 'Brand', name: SITE_NAME },
        offers: {
          '@type': 'Offer',
          url,
          price: item.priceNum,
          priceCurrency: 'KRW',
          availability: 'https://schema.org/MadeToOrder',
          seller: { '@id': `${SITE_URL}/#organization` },
        },
      },
    ],
  };
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
