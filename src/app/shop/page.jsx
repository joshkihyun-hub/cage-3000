import { Suspense } from 'react';
import { LOOKBOOK_COLLECTIONS } from '@/shared/constants/lookbook';
import ShopContent, { ShopView } from './shop-content';

export default function ShopPage() {
  // 구역의 이름·날짜·공개 예정 여부는 룩북 데이터 한 곳에서 가져온다. 룩북 파일은 사진을
  // 정적 import하므로 서버에서 필요한 값만 골라 넘긴다 — 샵 JS에 사진 정보가 실리지 않게.
  const collections = LOOKBOOK_COLLECTIONS.map(({ slug, title, date, upcoming = false }) => ({
    slug,
    title,
    date,
    upcoming,
  }));

  return (
    <div className="min-h-screen bg-white pt-32 md:pt-40 pb-24">
      {/* 여백은 헤더·푸터와 같은 24/48px 한 겹 — 예전엔 공용 틀(PageContainer)과 겹쳐 32/80px이었다. */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* useSearchParams()는 정적 렌더링 때 가장 가까운 Suspense 경계를 fallback으로
            내보낸다. fallback이 빈 칸이면 서버 HTML(검색엔진이 보는 화면)에 상품이 하나도
            안 담기므로, 분류를 고르지 않은 전체 화면을 fallback으로 둔다. ?category=가 있으면
            클라이언트에서 그 분류만 남긴다. */}
        <Suspense fallback={<ShopView collections={collections} />}>
          <ShopContent collections={collections} />
        </Suspense>
      </div>
    </div>
  );
}
