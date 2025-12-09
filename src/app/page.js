"use client";

import Image from 'next/image';
import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';

import { ShopItemCard } from '@/components/shop-item-card';


// ... imports remain same ...

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <Link href="/lookbook" className="block w-full h-full">
          {/* Desktop Image */}
          <div className="hidden md:block absolute inset-0">
            <Image
              src="/asset/details/main/C-6.jpg"
              alt="CAGE3000 Hero Desktop"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
              quality={100}
            />
          </div>

          {/* Mobile Image */}
          <div className="md:hidden absolute inset-0">
            <Image
              src="/asset/details/lookbook/9hat/A1.jpg"
              alt="CAGE3000 Hero Mobile"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
              quality={100}
            />
          </div>
        </Link>
      </section>

      {/* Shop Section */}
      <section id="shop" className="hidden md:block py-32 px-4 md:px-8 max-w-screen-2xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12">
          {items.map((item) => (
            <ShopItemCard key={item.id} item={item} />
          ))}
        </div>

        <div className="mt-24 flex justify-center">
          <Link href="/shop" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors border-b border-transparent hover:border-black pb-1">
            View All Collections
          </Link>
        </div>
      </section>
    </div>
  );
}
