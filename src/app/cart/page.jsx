'use client';

import { useCart } from '@/shared/context/cart-context';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import PageContainer from '@/components/page-container';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();

  const getTotalPrice = () => {
    const total = cart.reduce((acc, item) => {
      const price = item.priceNum || parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
      return acc + item.quantity * price;
    }, 0);
    return new Intl.NumberFormat('ko-KR').format(total);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <PageContainer>
      <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
        <div className="container mx-auto px-6 md:px-12 max-w-screen-lg">

          {/* Editorial Header Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 mb-16 md:mb-20 text-xs md:text-sm text-zinc-900 leading-relaxed">
            <p>(CAGE3000)</p>
            <p className="md:text-right">(Cart)</p>
            <p>(Seoul)</p>
            <p className="md:text-right">(About)</p>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl mb-14 md:mb-16 tracking-tight">
            (Your Cart)
          </h1>

          {cart.length === 0 ? (
            <div className="border-t border-zinc-900/90 pt-20">
              <p className="text-center text-sm text-zinc-400">(Empty)</p>
            </div>
          ) : (
            <>
              <ul className="border-t border-zinc-900/90">
                {cart.map((item, idx) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[44px_96px_1fr_auto] md:grid-cols-[64px_140px_1fr_auto] gap-4 md:gap-8 py-6 border-b border-zinc-100 items-start"
                  >
                    {/* Index marker (pink) */}
                    <p className="text-sm md:text-base pt-1">
                      <span className="bg-pink-100 px-1.5 py-0.5 text-zinc-900">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                    </p>

                    {/* Product image */}
                    <div className="relative aspect-[3/4] bg-white">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 96px, 140px"
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                      <p className="text-sm md:text-base text-zinc-900">
                        ({item.name})
                      </p>
                      <p className="text-xs md:text-sm text-zinc-500 mt-2">
                        {item.name === '03' || item.name === '07'
                          ? item.price
                          : '(Order Made)'}
                      </p>
                      <p className="text-xs md:text-sm text-zinc-400 mt-1">
                        (Quantity {item.quantity})
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-5 text-xs md:text-sm text-zinc-400 hover:text-red-500 transition-colors self-start"
                      >
                        (Remove)
                      </button>
                    </div>

                    {/* Price (right) */}
                    <p className="text-sm md:text-base text-zinc-900 text-right">
                      {item.name === '03' || item.name === '07' ? item.price : ''}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Total Row */}
              <div className="grid grid-cols-[1fr_auto] gap-6 py-6 border-b border-zinc-900/90 items-baseline">
                <p className="text-sm md:text-base text-zinc-500">(Total)</p>
                <p className="text-2xl md:text-3xl text-zinc-900">
                  ₩{getTotalPrice()}
                </p>
              </div>

              {/* Checkout — editorial link-style */}
              <div className="flex justify-end mt-10">
                <button
                  onClick={handleCheckout}
                  className="text-lg md:text-xl text-blue-600 hover:text-black transition-colors"
                >
                  (Checkout) →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
