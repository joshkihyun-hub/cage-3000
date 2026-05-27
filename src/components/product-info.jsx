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
        <div className="w-full md:max-w-md bg-transparent text-zinc-900 p-6 md:p-0">
            <div className="flex flex-col mb-6">
                <h1 className="text-2xl md:text-3xl tracking-normal text-black font-light leading-tight">
                    {item.name}
                </h1>
                <p className="text-sm font-light tracking-widest text-zinc-500 mt-2">
                    {item.name === '03' || item.name === '07' ? item.price : 'ORDER MADE'}
                </p>
            </div>

            {/* Accordion */}
            <div className="border-t border-zinc-200">
                <button
                    onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    className="w-full py-4 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-zinc-500 hover:text-black transition-colors font-medium"
                >
                    <span>Description</span>
                    {isDescriptionOpen ? <ChevronUp size={12} className="text-zinc-400" /> : <ChevronDown size={12} className="text-zinc-400" />}
                </button>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isDescriptionOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                    <div className="text-xs font-light text-zinc-600 leading-relaxed space-y-3 pb-4">
                        {item.material && (
                            <p className="whitespace-pre-line">
                                {item.material}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Size Selector */}
            <div className="mt-4 border-t border-zinc-200 pt-6">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-medium">Size</span>
                </div>
                <div className="flex gap-2">
                    <button
                        className="w-full py-3.5 border border-zinc-200 bg-white text-zinc-800 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors"
                        disabled
                    >
                        One Size
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
                <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-black text-white py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors duration-300 shadow-sm"
                >
                    Add to Bag
                </button>
                <button
                    onClick={handleBuyNow}
                    className="w-full border border-black text-black py-3.5 text-[10px] font-medium uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors duration-300"
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
};
