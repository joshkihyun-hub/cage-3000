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
      <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-lg">
          <h1 className="text-3xl md:text-4xl text-center mb-12 text-black uppercase">Your Cart</h1>
          {cart.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm tracking-widest uppercase">Your cart is empty.</p>
          ) : (
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-10">
                {cart.map((item) => (
                  <li key={item.id} className="grid grid-cols-[120px_1fr] md:grid-cols-[160px_1fr] gap-6 md:gap-10 items-start border-b border-zinc-100 pb-10 last:border-0">
                    <div className="relative aspect-[3/4] bg-white">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 120px, 160px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-lg md:text-xl text-black">{item.name}</h2>
                      <p className="text-xs tracking-widest text-zinc-500 mt-2">
                        {item.name === '03' || item.name === '07' ? item.price : 'ORDER MADE'}
                      </p>
                      <p className="text-[11px] tracking-widest text-zinc-400 uppercase mt-1">
                        Quantity {item.quantity}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="mt-6 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors self-start border-b border-transparent hover:border-black pb-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-12 border-t border-zinc-200 pt-8">
                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-[11px] uppercase tracking-widest text-zinc-500">Total</span>
                  <span className="text-2xl text-black">₩{getTotalPrice()}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                >
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
