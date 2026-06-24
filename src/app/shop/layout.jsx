// Server layout that supplies metadata for the /shop listing. The page itself
// is a client component (can't export metadata), so this wraps it.
// Product pages (/shop/[id]) override this via their own generateMetadata.
export const metadata = {
  title: 'Shop',
  description:
    'CAGE3000 컬렉션 — 서울에서 한 점씩 손으로 빚은 조각적 펠트 모자와 아방가르드 헤드웨어. Sculpted felt caps & avant-garde millinery, made to order.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop · CAGE3000',
    description: 'CAGE3000 컬렉션 — 조각적 펠트 모자와 아방가르드 헤드웨어.',
    url: '/shop',
  },
};

export default function ShopLayout({ children }) {
  return children;
}
