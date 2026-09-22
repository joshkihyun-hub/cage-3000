import { pageMetadata } from '@/lib/seo';

// 협업 아티스트·매체 이름은 사람들이 실제로 검색하는 단어라 한/영 표기를 함께 둔다.
export const metadata = pageMetadata({
  title: 'Projects',
  description:
    'CAGE3000 프로젝트 아카이브 — 커스텀 메이드(NMIXX 엔믹스 Heavy Serenade, 퓨린 PURYNN Wee-Woo 뮤직비디오), 협찬(하퍼스 바자 식케이 SIK-K, 에스콰이어 코리아, PUMA × 맨체스터 시티, DAZED 데이즈드), 개인 작업.',
  path: '/projects',
  ogDescription: 'NMIXX · 하퍼스 바자 식케이 · 에스콰이어 · PUMA × 맨체스터 시티 — CAGE3000 작업 아카이브.',
});

export default function ProjectsLayout({ children }) {
  return children;
}
