'use client';

import { items } from '@/shared/constants/shop-items';
import { ProductInfo } from '@/components/product-info';
import { ShopItemCard } from '@/components/shop-item-card';
import { grotesk } from '@/shared/fonts';
import Image from 'next/image';
import Link from 'next/link';
import { use, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function DesktopCarousel({ item }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1,
      zIndex: 1
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '25%' : '-25%',
      opacity: 0,
      scale: 0.9,
    })
  };

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + images.length) % images.length);
  };

  // 상자는 /shop 카드와 같은 3:4 — 왼쪽 반을 통째로 채우면 가로로 넓은 화면에서
  // 사진의 위아래(모자·얼굴, 밑단)가 크게 잘렸다. 폭은 왼쪽 반과 (높이 × 3/4) 중 작은 쪽 —
  // 넓은 화면은 높이에, 세로로 긴 창은 폭에 맞춰도 3:4가 깨지지 않는다.
  // 가로로 긴 작품(item.aspect, 가구)은 그 비율로 — 폭 계산에 쓰도록 --r(가로/세로)로 넘긴다.
  const [aw, ah] = (item.aspect || '3 / 4').split('/').map(Number);
  // 받을 파일 크기도 같은 계산으로 — 가로로 넓은 화면에선 상자가 높이에 맞춰져 왼쪽 반(50vw)보다
  // 좁다(1440×900에서 555px). 50vw로만 적으면 그보다 훨씬 큰 파일을 받는다. 화면 비율이
  // 높이 기준이 되는 경계(≈ 2 × 사진 비율 × 0.82)를 넘으면 높이로 계산한다. 모바일에선 숨으니 1px.
  const r = aw / ah;
  const sizes = `(min-width: 768px) and (min-aspect-ratio: ${Math.round(2 * r * 820)}/1000) calc((100vh - 160px) * ${r.toFixed(3)}), (min-width: 768px) 50vw, 1px`;
  return (
    <div
      className="relative w-[min(100%,calc((100vh_-_160px)*var(--r)))] group bg-white overflow-hidden"
      style={{ '--r': r, aspectRatio: `${aw} / ${ah}` }}
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", ease: [0.32, 0.72, 0, 1], duration: 0.8 },
            opacity: { duration: 0.5 },
            scale: { duration: 0.8, ease: [0.32, 0.72, 0, 1] }
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* 모바일에선 이 캐러셀이 숨겨지지만 priority라 미리 받는다 — md 미만에선
              1px로 잡아 가장 작은 파일만 받게 한다. */}
          <Image
            src={images[currentIndex]}
            alt={`${item.name} view ${currentIndex + 1}`}
            fill
            sizes={sizes}
            className="object-cover object-center"
            priority
          />
        </motion.div>
      </AnimatePresence>

      {/* 다음·이전 사진은 미리 받아 둔다 — 넘기는 동안 빈 흰 칸이 미끄러져 들어오지 않게. */}
      {images.length > 1 &&
        [...new Set([(currentIndex + 1) % images.length, (currentIndex - 1 + images.length) % images.length])].map((i) => (
          <Image key={i} src={images[i]} alt="" aria-hidden fill sizes={sizes} loading="eager" className="hidden" />
        ))}

      {/* Navigation Buttons - Only show if multiple images */}
      {/* Navigation - Minimal and refined */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            aria-label="이전 이미지"
            className="absolute left-8 top-1/2 -translate-y-1/2 group/nav focus:outline-none z-10"
          >
            <div className="p-4 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-black/80 stroke-[1px] transition-transform duration-300 group-hover/nav:-translate-x-0.5" />
            </div>
          </button>
          <button
            onClick={() => paginate(1)}
            aria-label="다음 이미지"
            className="absolute right-8 top-1/2 -translate-y-1/2 group/nav focus:outline-none z-10"
          >
            <div className="p-4 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm transition-all duration-300 opacity-0 group-hover:opacity-100 flex items-center justify-center">
              <ArrowRight className="w-6 h-6 text-black/80 stroke-[1px] transition-transform duration-300 group-hover/nav:translate-x-0.5" />
            </div>
          </button>

          {/* Indicators */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                aria-label={`이미지 ${idx + 1} 보기`}
                aria-current={idx === currentIndex}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 drop-shadow-md ${idx === currentIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                  }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// 모바일 사진 — 옆으로 넘기는 슬라이드. 아래 점은 지금 보고 있는 장을 짙게 표시한다.
// 데스크톱에선 숨겨지지만 첫 장은 priority라 미리 받는다. sizes를 비워 두면 100vw로 잡혀
// 숨은 사진을 3840px로 받았다 — md 이상에선 1px로.
function MobileSlider({ item }) {
  const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl];
  const [current, setCurrent] = useState(0);
  const onScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    const i = Math.round(scrollLeft / clientWidth);
    if (i !== current) setCurrent(i);
  };
  return (
    <div
      className="w-full relative aspect-[3/4] bg-white"
      style={item.aspect ? { aspectRatio: item.aspect } : undefined}
    >
      <div
        onScroll={onScroll}
        className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((imgSrc, idx) => (
          <div key={idx} className="relative w-full h-full flex-shrink-0 snap-center">
            <Image
              src={imgSrc}
              alt={`${item.name} detail ${idx + 1}`}
              fill
              sizes="(max-width: 767.98px) 100vw, 1px"
              className="object-cover object-center"
              priority={idx < 1}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10 pointer-events-none" aria-hidden>
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full backdrop-blur-sm transition-colors duration-300 ${idx === current ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// 만드는 과정 — 원본 번호 순서대로 한 장씩 따라가며 볼 수 있게 가로 사진을 고른 격자로 깐다
// (모바일 2열, 데스크톱 4열, 번호 표기 없이). 묶음이 여럿이면(스툴: 두 사람) 묶음마다 작은 제목.
function ProcessSection({ item }) {
  const label = `${grotesk.className} text-[11px] font-medium uppercase tracking-[0.04em] text-zinc-500`;
  return (
    <section className="px-6 md:px-12 pt-16 md:pt-24 pb-24 md:pb-32" aria-label="Process">
      <h2 className={`${label} mb-5 md:mb-8`}>Process</h2>
      <div className="flex flex-col gap-y-14 md:gap-y-20">
        {item.process.map((seq, s) => (
          <div key={s}>
            {seq.label && <h3 className={`${label} mb-4 md:mb-6 text-zinc-400`}>{seq.label}</h3>}
            <ol className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {seq.images.map((src, i) => (
                <li
                  key={src}
                  // 마무리 장면(finale)은 두 칸 폭 — 데스크톱에선 다음 줄 가운데에 사진 네 장 넓이로 놓인다.
                  className={seq.finale && i === seq.images.length - 1 ? 'col-span-2 md:col-start-2' : undefined}
                >
                  <div className="relative aspect-[3/2] bg-zinc-50 overflow-hidden">
                    <Image
                      src={src}
                      alt={`${item.name} process ${seq.label ? `${seq.label} ` : ''}${i + 1}`}
                      fill
                      sizes={seq.finale && i === seq.images.length - 1 ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'}
                      className="object-cover"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ShopItemPage({ params }) {
  const unwrappedParams = use(params);
  const item = items.find((item) => item.id === parseInt(unwrappedParams.id));

  if (!item) {
    return <div className="text-center py-32">Item not found</div>;
  }

  // 다른 상품 — 지금 상품의 다음 번호부터 3개(끝에서는 처음으로 돌아간다). 상품마다 다른 줄이 보인다.
  // 판매하지 않는 작품(가구)은 이 줄에 넣지 않고, 가구 페이지에선 줄 자체를 두지 않는다 —
  // 가로 사진이 세로 카드 사이에 끼면 높이가 어긋나고, 작품을 보는 자리라 "다른 상품"이 어울리지 않는다.
  const forSaleItems = items.filter((i) => i.forSale !== false);
  const at = forSaleItems.findIndex((i) => i.id === item.id);
  const relatedItems = item.forSale === false
    ? []
    : [1, 2, 3].map((step) => forSaleItems[(at + step) % forSaleItems.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* ==========================================
          MOBILE LAYOUT (Stacked)
          ========================================== */}
      <div className="md:hidden flex flex-col pt-32">
        {/* Image Section */}
        {/* Image Section */}
        {/* Image Slider Section */}
        {/* 데스크톱에선 이 슬라이더가 숨겨지지만 첫 장은 priority라 미리 받는다. sizes를
            비워 두면 100vw로 잡혀 숨은 사진을 3840px로 받았다 — md 이상에선 1px로. */}
        <MobileSlider item={item} />

        {/* Info Section (Stacked below image) */}
        <div className="w-full">
          <ProductInfo item={item} />
        </div>
      </div>

      {/* ==========================================
          DESKTOP LAYOUT (Horizontal Flex)
          ========================================== */}
      {/* ==========================================
          DESKTOP LAYOUT (Fixed Hero + Sticky Info)
          ========================================== */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 min-h-screen">
          {/* Carousel Images (Left) */}
          {/* 다른 페이지와 같은 시작선(160px) — 예전엔 80px에서 시작해 로고·메뉴가 사진 위에 겹쳤다. */}
          <div className="relative w-full h-[calc(100vh-160px)] top-[160px] bg-white flex items-center justify-center overflow-hidden">
            <DesktopCarousel item={item} />
          </div>

          {/* Sticky Info (Right) */}
          <div className="relative h-full">
            <div className="sticky top-0 h-screen flex flex-col justify-center items-center">
              <ProductInfo item={item} />
            </div>
          </div>
        </div>
      </div>

      {item.process && <ProcessSection item={item} />}

      {/* ==========================================
          SHARED: 다른 상품 — 쇼핑 페이지와 같은 카드. 모바일은 2개, 데스크탑은 3개.
          ========================================== */}
      {relatedItems.length > 0 && (
        <section className="px-6 md:px-12 pt-16 md:pt-24 pb-24">
          <h2 className={`${grotesk.className} mb-5 md:mb-8 text-[11px] font-medium uppercase tracking-[0.04em] text-zinc-500`}>
            More pieces
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-8 [&>*:nth-child(3)]:hidden md:[&>*:nth-child(3)]:flex">
            {relatedItems.map((related) => (
              <ShopItemCard key={related.id} item={related} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
