import { Suspense } from 'react';
import { LOOKBOOK_COLLECTIONS } from '@/shared/constants/lookbook';
import ShopContent, { ShopView } from './shop-content';

// 서버 HTML에 문자열로만 심는다 — React가 <script>를 직접 그리면 브라우저 쪽 렌더(클라이언트 이동 등)에서
// "스크립트는 실행되지 않는다" 경고가 뜬다. innerHTML로 들어간 스크립트는 처음 페이지를 읽을 때만 돌고,
// 브라우저에서 다시 그릴 땐 조용히 무시된다(원래 의도와 같다).
const HIDE_FALLBACK_FOR_QUERY = {
  __html:
    "<script>if(/[?&](category|collection)=/.test(location.search))document.currentScript.closest('[data-shop-fallback]').setAttribute('data-query','')</script>",
};

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
        <h1 className="sr-only">CAGE3000 Shop</h1>
        {/* useSearchParams()는 정적 렌더링 때 가장 가까운 Suspense 경계를 fallback으로
            내보낸다. fallback이 빈 칸이면 서버 HTML(검색엔진이 보는 화면)에 상품이 하나도
            안 담기므로, 분류를 고르지 않은 전체 화면을 fallback으로 둔다. ?category=가 있으면
            클라이언트에서 그 분류만 남긴다. */}
        <Suspense
          fallback={
            // 주소에 분류·컬렉션이 붙어 들어오면(인스타 링크 등) 미리 그린 전체 화면이 잠깐 비쳤다가
            // 바뀌었다 — 그런 주소일 때만 이 자리를 화면이 준비될 때까지 비워 둔다(globals.css).
            // 스크립트는 바로 아래 내용보다 먼저 읽혀서 처음 그려질 때부터 숨는다.
            <div data-shop-fallback>
              <div hidden dangerouslySetInnerHTML={HIDE_FALLBACK_FOR_QUERY} />
              <ShopView collections={collections} />
            </div>
          }
        >
          <ShopContent collections={collections} />
        </Suspense>
      </div>
    </div>
  );
}
