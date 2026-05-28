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
        <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

          <Block>
            <h1 className="text-base md:text-lg">Your Cart</h1>
          </Block>

          {cart.length === 0 ? (
            <Block className="mt-3">
              <p className="text-sm text-zinc-500">Empty</p>
            </Block>
          ) : (
            <>
              <div className="mt-3 space-y-3">
                {cart.map((item) => (
                  <Block key={item.id}>
                    <div className="grid grid-cols-[80px_1fr] md:grid-cols-[120px_1fr] gap-4 md:gap-6">
                      <div className="relative aspect-[3/4] bg-white">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 80px, 120px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-sm md:text-base">{item.name}</p>
                          <p className="text-sm text-zinc-600 mt-1">
                            {item.name === '03' || item.name === '07'
                              ? item.price
                              : 'Order Made'}
                          </p>
                          <p className="text-sm text-zinc-500 mt-1">
                            Quantity {item.quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="mt-3 text-sm text-zinc-500 hover:text-red-600 self-start hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </Block>
                ))}
              </div>

              <Block className="mt-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm">Total</p>
                  <p className="text-base md:text-lg">₩{getTotalPrice()}</p>
                </div>
              </Block>

              <Block className="mt-3">
                <button
                  onClick={handleCheckout}
                  className="text-sm md:text-base hover:underline"
                >
                  Checkout →
                </button>
              </Block>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function Block({ children, className = '' }) {
  return (
    <section className={`border-t border-l border-zinc-900 pt-2 pl-3 pb-4 ${className}`}>
      {children}
    </section>
  );
}
