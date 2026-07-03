'use client';

import { items } from '@/shared/constants/shop-items';
import { ProductInfo } from '@/components/product-info';
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

  return (
    <div className="relative w-full h-full group bg-white overflow-hidden">
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
          <Image
            src={images[currentIndex]}
            alt={`${item.name} view ${currentIndex + 1}`}
            fill
            sizes="50vw"
            className="object-cover object-center"
            priority
          />
        </motion.div>
      </AnimatePresence>

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

export default function ShopItemPage({ params }) {
  const unwrappedParams = use(params);
  const item = items.find((item) => item.id === parseInt(unwrappedParams.id));

  if (!item) {
    return <div className="text-center py-32">Item not found</div>;
  }

  const relatedItems = items.filter((i) => i.id !== item.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* ==========================================
          MOBILE LAYOUT (Stacked)
          ========================================== */}
      <div className="md:hidden flex flex-col pt-20">
        {/* Image Section */}
        {/* Image Section */}
        {/* Image Slider Section */}
        <div className="w-full relative aspect-[3/4] bg-white">
          <div className="absolute inset-0 flex overflow-x-auto snap-x snap-mandatory no-scrollbar">
            {item.images && item.images.length > 0 ? (
              item.images.map((imgSrc, idx) => (
                <div key={idx} className="relative w-full h-full flex-shrink-0 snap-center">
                  <Image
                    src={imgSrc}
                    alt={`${item.name} detail ${idx + 1}`}
                    fill
                    className="object-cover object-center"
                    priority={idx < 1}
                  />
                </div>
              ))
            ) : (
              <div className="relative w-full h-full flex-shrink-0 snap-center">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
            )}
          </div>
          {/* Page Indicator (Optional - adding simple dots) */}
          {item.images && item.images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {item.images.map((_, idx) => (
                <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm" />
              ))}
            </div>
          )}
        </div>

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
          <div className="relative w-full h-[calc(100vh-80px)] top-[80px] bg-white flex items-center justify-center overflow-hidden">
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

      {/* ==========================================
          SHARED: View More Section
          ========================================== */}

    </div>
  );
}
