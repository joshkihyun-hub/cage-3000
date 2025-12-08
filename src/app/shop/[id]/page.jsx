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
        <div className="w-full">
          {item.images && item.images.length > 0 ? (
            item.images.map((imgSrc, idx) => (
              <div key={idx} className="relative w-full mb-1 bg-zinc-50">
                <Image
                  src={imgSrc}
                  alt={`${item.name} detail ${idx + 1}`}
                  width={1000}
                  height={1333}
                  className="w-full h-auto object-cover"
                  priority={idx < 1}
                />
              </div>
            ))
          ) : (
            <div className="relative w-full aspect-[3/4] bg-zinc-50">
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

        {/* Info Section (Stacked below image) */}
        <div className="w-full">
          <ProductInfo item={item} />
        </div>
      </div>

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
      <section className="relative z-10 bg-white py-24 px-4 md:px-8 max-w-screen-2xl mx-auto min-h-[50vh]">
        <h2 className="text-xs font-medium uppercase tracking-[0.2em] mb-12 text-zinc-400">View More</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-12">
          {relatedItems.map((relatedItem) => (
            <Link key={relatedItem.id} href={`/shop/${relatedItem.id}`}>
              <div className="group cursor-pointer flex flex-col h-full">
                <div className="relative aspect-[3/4] bg-zinc-50 mb-4 overflow-hidden">
                  <Image
                    src={relatedItem.imageUrl}
                    alt={relatedItem.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-light text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                    VIEW
                  </div>
                </div>

                <div className="mt-auto space-y-1">
                  <h3 className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-black">
                    {relatedItem.name}
                  </h3>
                  <p className="text-[10px] md:text-xs font-medium tracking-widest text-zinc-900">
                    {relatedItem.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
