import { pageMetadata, SITE_NAME } from '@/lib/seo';

const base = pageMetadata({
  title: 'Green — Lookbook',
  description:
    'CAGE3000 GREEN 컬렉션 룩북(2025.12) — 헤드웨어와 실루엣을 담은 비주얼. 서울 기반 디자이너 패션 브랜드.',
  path: '/lookbook/green',
  ogDescription: 'CAGE3000 GREEN 컬렉션 룩북 — 2025.12.',
});

// /lookbook 레이아웃이 문자열 제목을 쓰는 탓에 루트의 '%s · CAGE3000' 템플릿이 여기까지
// 내려오지 않는다 — 전체 제목을 직접 적는다.
export const metadata = { ...base, title: { absolute: `Green — Lookbook · ${SITE_NAME}` } };

export default function LookbookGreenLayout({ children }) {
  return children;
}
