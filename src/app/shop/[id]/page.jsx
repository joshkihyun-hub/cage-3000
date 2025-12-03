'use client';

import { items } from '@/shared/constants/shop-items';
import { useCart } from '@/shared/context/cart-context';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ShopItemPage({ params }) {
  const { addToCart, clearCart } = useCart();
  const router = useRouter();
  const item = items.find((item) => item.id === parseInt(params.id));

  if (!item) {
    return <div className="text-center py-10">Item not found</div>;
  }

  const handleBuyNow = () => {
    clearCart(); // Clear existing items in cart
    addToCart(item, 1); // Add current item with quantity 1
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 lg:px-0 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="w-full border border-black">
          <Image
            src={item.imageUrl}
            alt={item.name}
            width={1000}
            height={1200}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="lg:sticky top-24">
          <h1 className="text-4xl lg:text-5xl font-semibold mb-6">{item.name}</h1>
          <p className="text-base text-gray-600 leading-relaxed mb-4">{item.description}</p>
          <p className="text-base text-gray-600 leading-relaxed mb-8">{item.description_ko}</p>
          <p className="text-2xl font-medium mb-10">{item.price}</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => addToCart(item)}
              className="w-full border border-zinc-900 text-zinc-900 py-4 text-base font-semibold tracking-wider hover:bg-zinc-900 hover:text-white transition-colors"
            >
              ADD TO CART
            </button>
            <button 
              onClick={handleBuyNow}
              className="w-full bg-zinc-900 text-white py-4 text-base font-semibold tracking-wider hover:bg-zinc-800 transition-colors"
            >
              BUY NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
