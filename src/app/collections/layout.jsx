import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Collections',
  description:
    'CAGE3000 컬렉션 — 시즌마다 선보이는 작업의 룩북. 무드와 실루엣을 담은 비주얼. 서울 기반 디자이너 패션 브랜드.',
  path: '/collections',
  ogDescription: 'CAGE3000 시즌 컬렉션 룩북.',
});

export default function CollectionsLayout({ children }) {
  return children;
}
