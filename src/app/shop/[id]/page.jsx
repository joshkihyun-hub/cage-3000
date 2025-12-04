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
        <div className="relative w-full aspect-[3/4] bg-zinc-50">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover object-top"
            priority
          />
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
        {/* Fixed Hero Images (Background) */}
        <div className="fixed inset-0 z-0 h-screen w-full">
          <div className="grid grid-cols-2 h-full">
            {/* Left Image */}
            <div className="relative h-full w-full bg-zinc-50">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover object-center"
                priority
              />
            </div>

            {/* Right Image */}
            <div className="relative h-full w-full bg-zinc-50">
              <Image
                src={item.imageUrl}
                alt={`${item.name} detail`}
                fill
                className="object-cover object-center"
                priority
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content Wrapper */}
        <div className="relative z-10">
          {/* Scroll Track for Sticky Info Box */}
          <div className="h-[150vh] w-full flex flex-col justify-end pb-0">
            {/* Sticky Info Box */}
            <div className="sticky bottom-0 w-full flex justify-center pb-0">
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
