import { items } from '@/shared/constants/shop-items';
import { PROJECT1_ITEMS } from '@/shared/constants/project1-images';
import { SITE_URL } from '@/lib/seo';

// /llms.txt — AI 어시스턴트가 브랜드를 요약할 때 집어갈 사실을 한 장에 모아 둔다.
// 아직 널리 읽히는 규약은 아니지만 비용이 거의 없고, 사람이 읽기에도 정확한 요약이다.
// 내용은 모두 사이트의 실제 데이터(카탈로그·프로젝트)에서 끌어온다.
export const dynamic = 'force-static';

export function GET() {
  const prices = [...new Set(items.map((item) => item.priceNum))].sort((a, b) => a - b);
  const priceRange = prices.map((price) => `₩${price.toLocaleString('ko-KR')}`).join(' / ');

  const body = `# CAGE3000 (케이지3000)

> 서울 기반 디자이너 패션 브랜드. 디자이너 김기현(Kihyun Kim)이 이끄는 주문 제작 컬렉션으로,
> 조각적인 실루엣의 의상과 헤드웨어를 한 점씩 만듭니다.
> A designer fashion brand from Seoul, led by Kihyun Kim — garments and headwear,
> made to order, each piece by hand.

## Facts
- 브랜드명: CAGE3000 (케이지3000) / 운영: 케이에이치엔(KHN)
- 디자이너: 김기현 (Kihyun Kim)
- 분야: 디자이너 패션 — 의상과 헤드웨어, 주문 제작 (designer fashion, made to order)
- 위치: 서울특별시 서대문구 연희동
- 제작 방식: 주문 후 제작 (made to order), 결제 후 영업일 기준 4–6일 내 제작 완료 후 순차 배송
- 현재 컬렉션 소재: Suri Alpaca 40% + Wool 60%, 안감 Cotton 100%
- 현재 컬렉션 사이즈: One Size
- 가격: ${priceRange}
- 이메일: contact@cage3000.com
- 인스타그램: https://instagram.com/cage3k

## Pages
- [Shop](${SITE_URL}/shop): 컬렉션 전체 (${items.length} pieces)
- [Lookbook](${SITE_URL}/lookbook): 시즌 컬렉션 비주얼
- [Projects](${SITE_URL}/projects): 협업·뮤직비디오·에디토리얼 아카이브
- [About](${SITE_URL}/about): 브랜드와 디자이너
- [FAQ](${SITE_URL}/faq): 주문 제작·소재·배송 관련 질문

## Projects
${PROJECT1_ITEMS.map((project) => `- [${project.title}](${SITE_URL}/projects/${project.slug}): ${project.description_ko}`).join('\n')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
