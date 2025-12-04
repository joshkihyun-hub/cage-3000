'use client';

import { useCart } from '@/shared/context/cart-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const ProductInfo = ({ item }) => {
    const { addToCart, clearCart } = useCart();
    const router = useRouter();
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

    const handleBuyNow = () => {
        clearCart();
        addToCart(item, 1);
        router.push('/checkout');
    };

    return (
        <div className="w-full md:max-w-md bg-black text-white p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-lg md:text-xl font-serif uppercase tracking-wider">
                    {item.name}
                </h1>
                <p className="text-sm font-light tracking-widest text-zinc-300 whitespace-nowrap ml-4">
                    {item.price}
                </p>
            </div>

            {/* Accordion */}
            <div className="border-t border-white/20">
                <button
                    onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    className="w-full py-3 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] hover:text-zinc-300 transition-colors"
                >
                    <span>Description</span>
                    {isDescriptionOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isDescriptionOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="text-xs font-light text-zinc-300 leading-relaxed space-y-3 pb-3">
                        <p>{item.description}</p>
                        <p>{item.description_ko}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
                <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-white text-black py-3 text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors duration-300"
                >
                    Add to Bag
                </button>
                <button
                    onClick={handleBuyNow}
                    className="w-full border border-white text-white py-3 text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors duration-300"
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
};
