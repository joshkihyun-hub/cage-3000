'use client';

import { useCart } from '@/shared/context/cart-context';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// 상품 정보 패널 — 로그인/회원가입 페이지와 같은 Block 디자인 언어
// (border-t + border-l 검정 라인, 텍스트 버튼 "… →")로 통일.
function Block({ children, className = '' }) {
    return (
        <section className={`border-t border-l border-zinc-900 pt-2 pl-3 pb-4 ${className}`}>
            {children}
        </section>
    );
}

export const ProductInfo = ({ item }) => {
    const { addToCart, clearCart } = useCart();
    const router = useRouter();
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    const [added, setAdded] = useState(false);
    const addedTimer = useRef(null);

    useEffect(() => () => clearTimeout(addedTimer.current), []);

    const handleAddToBag = () => {
        addToCart(item);
        // 담김 피드백 — 버튼 라벨이 잠시 "Added ✓"로 바뀐다.
        setAdded(true);
        clearTimeout(addedTimer.current);
        addedTimer.current = setTimeout(() => setAdded(false), 1600);
    };

    const handleBuyNow = () => {
        clearCart();
        addToCart(item, 1);
        router.push('/checkout');
    };

    const priceText = item.name === '03' || item.name === '07' ? item.price : 'Order Made';

    return (
        <div className="w-full md:max-w-md text-zinc-900 p-6 md:p-0">
            <div className="space-y-3">
                <Block>
                    <h1 className="text-lg md:text-xl">{item.name}</h1>
                    <p className="text-sm text-zinc-500 mt-1">{priceText}</p>
                </Block>

                {/* Made-to-order lead time — 설명을 열기 전에 제작 기간부터 보이게. */}
                <Block>
                    <p className="text-sm mb-2">Made to Order</p>
                    <p className="text-sm text-zinc-700 leading-relaxed">
                        결제 후 영업일 기준 4–6일 내에 제작이 완료되며 순차 배송됩니다.
                    </p>
                </Block>

                {item.material && (
                    <Block>
                        <button
                            type="button"
                            onClick={() => setIsDescriptionOpen((o) => !o)}
                            className="w-full flex justify-between items-center text-sm hover:underline"
                            aria-expanded={isDescriptionOpen}
                        >
                            <span>Description</span>
                            <ChevronDown
                                size={14}
                                className={`text-zinc-400 transition-transform duration-300 ${isDescriptionOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${isDescriptionOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
                        >
                            <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                                {item.material}
                            </p>
                        </div>
                    </Block>
                )}

                <Block>
                    <p className="text-sm mb-2">Size</p>
                    <p className="text-sm text-zinc-700">One Size</p>
                </Block>

                <Block>
                    <button
                        type="button"
                        data-sound="firm"
                        onClick={handleAddToBag}
                        className="text-sm md:text-base hover:underline"
                    >
                        {added ? 'Added to Bag ✓' : 'Add to Bag →'}
                    </button>
                </Block>

                <Block>
                    <button
                        type="button"
                        data-sound="firm"
                        onClick={handleBuyNow}
                        className="text-sm md:text-base hover:underline"
                    >
                        Buy Now →
                    </button>
                </Block>
            </div>
        </div>
    );
};
