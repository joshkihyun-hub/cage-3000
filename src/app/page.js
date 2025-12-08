"use client";

import Image from 'next/image';
import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <Link href="/lookbook" className="block w-full h-full">
          {/* Desktop Image */}
          <div className="hidden md:block absolute inset-0">
            <Image
              src="/main 2.jpeg"
              alt="CAGE3000 Hero Desktop"
              fill
              className="object-cover object-center scale-125"
              priority
              quality={100}
            />
          </div>

          {/* Mobile Image */}
          <div className="md:hidden absolute inset-0">
            <Image
              src="/asset/details/lookbook/9hat/6.jpg"
              alt="CAGE3000 Hero Mobile"
              fill
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
            <div key={item.id} className="group cursor-pointer flex flex-col h-full">
              <div className="relative aspect-[3/4] bg-zinc-50 mb-4 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white font-light text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                  VIEW
                </div>
              </div>

              <div className="mt-auto space-y-1">
                <h3 className="text-[10px] md:text-xs font-medium uppercase tracking-widest text-black">
                  {item.name}
                </h3>
                <p className="text-[10px] md:text-xs font-medium tracking-widest text-zinc-900">
                  {item.price}
                </p>
              </div>
            </div>
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
