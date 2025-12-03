'use client';

import { useCart } from '@/shared/context/cart-context';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Anton } from 'next/font/google';

const anton = Anton({ subsets: ['latin'], weight: ['400'] });

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
    <div className="bg-white text-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className={`${anton.className} text-4xl md:text-5xl font-semibold text-center mb-12 tracking-tighter`}>Your Cart</h1>
        {cart.length === 0 ? (
          <p className="text-center text-zinc-500 text-xl">Your cart is feeling a little empty.</p>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ul className="space-y-8">
              {cart.map((item) => (
                <li key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-zinc-200 p-4">
                  <div className="md:col-span-1">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      width={200}
                      height={250}
                      className="object-cover w-full"
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col justify-between h-full">
                    <div>
                      <h2 className={`${anton.className} text-3xl font-bold tracking-tight`}>{item.name}</h2>
                      <p className="text-zinc-500 text-lg mt-2">{item.price}</p>
                      <p className="text-zinc-500 text-lg">Quantity: {item.quantity}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-400 font-bold self-start mt-4 md:mt-0 text-lg"
                    >
                      REMOVE
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-12 flex flex-col md:flex-row justify-between items-center border-t-2 border-zinc-200 pt-8">
              <h2 className={`${anton.className} text-4xl font-bold tracking-tight`}>Total: ${getTotalPrice()}</h2>
              <button 
                onClick={handleCheckout}
                className="mt-6 md:mt-0 bg-zinc-900 text-white py-3 px-12 text-2xl font-bold tracking-wider hover:bg-zinc-800 transition-colors"
              >
                CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
