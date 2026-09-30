'use client';


import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';
import { ShopItemCard } from '@/components/shop-item-card';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ProductGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-16">
      {items.map((item, index) => (
        // Only the first grid row is above the fold — preload just those.
        <ShopItemCard key={item.id} item={item} priority={index < 3} />
      ))}
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  if (category === 'clothes') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden">


        {/* Text Container */}
        {/* 등장 효과는 globals.css의 키프레임 — framer-motion을 이 한 화면 때문에 싣지 않는다. */}
        <div className="text-center z-10 flex flex-col gap-4">
          <h2
            className="text-2xl md:text-4xl text-black tracking-widest"
            style={{ animation: 'rise-in 0.8s ease-out 0.5s both' }}
          >
            COMING SOON
          </h2>

          <p
            className="text-[10px] md:text-xs font-light text-zinc-500 uppercase tracking-[0.3em]"
            style={{ animation: 'fade-in-plain 0.8s ease-out 1s both' }}
          >
            New Collection Launching Soon
          </p>

          <div
            className="w-16 h-px bg-black mx-auto mt-4"
            style={{ animation: 'draw-x 1.5s cubic-bezier(0.42, 0, 0.58, 1) 1.2s both' }}
          />
        </div>
      </div>
    );
  }

  return <ProductGrid />;
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-white pt-32 md:pt-40 pb-24">
      {/* 여백은 헤더·푸터와 같은 24/48px 한 겹 — 예전엔 공용 틀(PageContainer)과 겹쳐 32/80px이었다. */}
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
        {/* useSearchParams()는 정적 렌더링 때 가장 가까운 Suspense 경계를 fallback으로
            내보낸다. fallback이 빈 칸이면 서버 HTML(검색엔진이 보는 화면)에 상품이 하나도
            안 담기므로, 기본값인 상품 그리드를 fallback으로 둔다. ?category=clothes일 때만
            클라이언트에서 COMING SOON으로 바뀐다. */}
        <Suspense fallback={<ProductGrid />}>
          <ShopContent />
        </Suspense>
      </div>
    </div>
  );
}
