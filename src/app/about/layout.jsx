export const metadata = {
  title: 'About',
  description:
    'CAGE3000와 디자이너 김기현(KHN) 이야기 — 서울을 기반으로 한 점 한 점 손으로 만드는 made-to-order 밀리너리 브랜드.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About · CAGE3000',
    description: '서울 기반 made-to-order 밀리너리 브랜드 CAGE3000와 디자이너 김기현(KHN).',
    url: '/about',
  },
};

export default function AboutLayout({ children }) {
  return children;
}
