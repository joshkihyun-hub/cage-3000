'use client';

import { items } from '@/shared/constants/shop-items';
import { ProductInfo } from '@/components/product-info';
import Image from 'next/image';
import Link from 'next/link';
import { use } from 'react';

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
        <div className="w-full relative aspect-[3/4] bg-zinc-50">
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
          {/* Scrollable Images (Left) */}
          <div className="w-full">
            {item.images && item.images.length > 0 ? (
              item.images.map((imgSrc, idx) => (
                <div key={idx} className="relative w-full mb-1">
                  <Image
                    src={imgSrc}
                    alt={`${item.name} detail ${idx + 1}`}
                    width={1000}
                    height={1200}
                    className="w-full h-auto object-cover"
                    priority={idx < 2}
                  />
                </div>
              ))
            ) : (
              // Fallback if no images array
              <div className="relative w-full h-screen">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
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
