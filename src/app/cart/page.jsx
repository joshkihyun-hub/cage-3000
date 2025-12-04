'use client';

import { useCart } from '@/shared/context/cart-context';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import PageContainer from '@/components/page-container';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();

  const getTotalPrice = () => {
    return cart.reduce((acc, item) => acc + item.quantity * parseFloat(item.price.replace('$', '')), 0).toFixed(2);
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <PageContainer>
      <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
        <div className="container mx-auto px-4 md:px-8 max-w-screen-lg">
          <h1 className="font-serif text-3xl md:text-4xl text-center mb-16 text-black uppercase">Your Cart</h1>
          {cart.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm tracking-widest uppercase">Your cart is empty.</p>
          ) : (
            <div className="max-w-3xl mx-auto">
              <ul className="space-y-12">
                {cart.map((item) => (
                  <li key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start border-b border-zinc-100 pb-12 last:border-0">
                    <div className="md:col-span-4 relative aspect-[3/4] bg-zinc-50">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="md:col-span-8 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-2">
                        <h2 className="font-serif text-xl text-black">{item.name}</h2>
                        <p className="text-xs tracking-widest text-zinc-500">{item.price}</p>
                        <p className="text-xs tracking-widest text-zinc-500">QUANTITY: {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black transition-colors self-start border-b border-transparent hover:border-black pb-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-16 border-t border-zinc-200 pt-8">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs uppercase tracking-widest text-zinc-500">Total</span>
                  <span className="font-serif text-xl text-black">${getTotalPrice()}</span>
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
