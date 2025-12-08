
import Image from 'next/image';
import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';

import { ShopItemCard } from '@/components/shop-item-card';

import PageContainer from '@/components/page-container';

export default function ShopPage() {
  return (
    <PageContainer>
      <div className="min-h-screen bg-white pt-32 md:pt-40 pb-24">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-16">
            {items.map((item) => (
              <ShopItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
