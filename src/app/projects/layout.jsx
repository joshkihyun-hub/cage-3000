import { pageMetadata } from '@/lib/seo';

// 협업 아티스트·매체 이름은 사람들이 실제로 검색하는 단어라 한/영 표기를 함께 둔다.
export const metadata = pageMetadata({
  title: 'Projects',
  description:
    'CAGE3000 프로젝트 아카이브 — NMIXX(엔믹스) Heavy Serenade 뮤직비디오, 하퍼스 바자 식케이(SIK-K), 에스콰이어 코리아, PUMA × 맨체스터 시티, DAZED(데이즈드) 등 협업·뮤직비디오·에디토리얼 헤드웨어 작업 기록.',
  path: '/projects',
  ogDescription: 'NMIXX · 하퍼스 바자 식케이 · 에스콰이어 · PUMA × 맨체스터 시티 — CAGE3000 헤드웨어 작업 아카이브.',
});

export default function ProjectsLayout({ children }) {
  return children;
}
