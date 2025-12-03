
import Image from 'next/image';
import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {items.map((item) => (
          <Link key={item.id} href={`/shop/${item.id}`}>
            <div className="group cursor-pointer">
              <div className="border border-black relative w-full overflow-hidden" style={{ paddingTop: '125%' }}> {/* 4:5 Aspect Ratio (height / width * 100) */}
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="text-base text-gray-500 mt-1">{item.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
