
import Image from 'next/image';
import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';

import PageContainer from '@/components/page-container';

export default function ShopPage() {
  return (
    <PageContainer>
      <div className="min-h-screen bg-white pt-32 md:pt-40 pb-24">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-16">
            {items.map((item) => (
              <Link key={item.id} href={`/shop/${item.id}`}>
                <div className="group cursor-pointer flex flex-col h-full">
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
