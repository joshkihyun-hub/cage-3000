import { pageMetadata } from '@/lib/seo';

// Server layout that supplies metadata for the /shop listing. The page itself
// is a client component (can't export metadata), so this wraps it.
// Product pages (/shop/[id]) override this via their own generateMetadata.
export const metadata = pageMetadata({
  title: 'Shop',
  description:
    'CAGE3000 컬렉션 — 서울 기반 디자이너 패션 브랜드가 한 점씩 주문 제작하는 제품. 현재 컬렉션은 조각적 펠트 모자와 아방가르드 헤드웨어입니다.',
  path: '/shop',
  ogDescription: 'CAGE3000 컬렉션 — 서울에서 한 점씩 주문 제작합니다.',
});

export default function ShopLayout({ children }) {
  return children;
}
