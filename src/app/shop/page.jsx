'use client';


import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';
import { ShopItemCard } from '@/components/shop-item-card';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

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
        <div className="text-center z-10 flex flex-col gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-2xl md:text-4xl text-black tracking-widest"
          >
            COMING SOON
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-[10px] md:text-xs font-light text-zinc-500 uppercase tracking-[0.3em]"
          >
            New Collection Launching Soon
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
            className="w-16 h-px bg-black mx-auto mt-4"
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
