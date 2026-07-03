"use client";

import { getImageProps } from 'next/image';
import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';

import { ShopItemCard } from '@/components/shop-item-card';

// Hero art direction: one <picture> with a desktop <source> instead of two
// CSS-hidden priority <Image>s — the old approach preloaded BOTH hero images
// on every device, so mobile paid for the desktop shot too.
const heroCommon = { alt: '', sizes: '100vw', quality: 85, priority: true };
const {
  props: { srcSet: heroDesktopSrcSet },
} = getImageProps({
  ...heroCommon,
  width: 2400,
  height: 1600,
  src: '/asset/details/lookbook/9hat/A3.jpeg',
});
const {
  props: { srcSet: heroMobileSrcSet, ...heroImgProps },
} = getImageProps({
  ...heroCommon,
  width: 1600,
  height: 2400,
  src: '/asset/details/shop/9hat/hat6/shop_hat6_lookbook1.jpg',
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <Link href="/lookbook" className="block w-full h-full">
          <picture>
            <source media="(min-width: 768px)" srcSet={heroDesktopSrcSet} />
            <img
              {...heroImgProps}
              srcSet={heroMobileSrcSet}
              alt="CAGE3000 — sculpted headwear"
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
          </picture>
        </Link>
      </section>

      {/* Shop Section */}
      <section id="shop" className="py-20 md:py-32 px-4 md:px-8 max-w-screen-2xl mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-y-12">
          {items.map((item) => (
            <ShopItemCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-16 md:mt-24 flex justify-center">
          <Link href="/shop" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">
            View All Collections
          </Link>
        </div>
      </section>
    </div>
  );
}
