'use client';

import { useCart } from '@/shared/context/cart-context';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { ShareButton } from '@/components/share-button';
import { PROJECT1_ITEMS } from '@/shared/constants/project1-images';
import { grotesk } from '@/shared/fonts';

// 사이트 공통 글자 체계 — 라벨 11px(대문자·회색) · 본문 13px · 제목 하나만 16/20px.
const LABEL = 'text-[11px] uppercase tracking-[0.04em] text-zinc-500';
const BODY = 'text-[13px] leading-relaxed text-zinc-700';
const ACTION = 'text-[13px] font-medium text-black hover:underline underline-offset-2';

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

    // 이 모자가 등장한 프로젝트 — 상품 데이터의 wornIn(프로젝트 slug 목록)으로 잇는다.
    const wornIn = (item.wornIn || [])
        .map((slug) => PROJECT1_ITEMS.find((project) => project.slug === slug))
        .filter(Boolean);

    const handleBuyNow = () => {
        clearCart();
        addToCart(item, 1);
        router.push('/checkout');
    };

    return (
        <div className={`${grotesk.className} w-full md:max-w-md text-zinc-900 p-6 md:p-0`}>
            <div className="space-y-3">
                <Block>
                    <h1 className="text-[16px] md:text-[20px] font-medium tracking-[-0.01em] leading-tight">{item.name}</h1>
                    <p className="mt-1.5 text-[13px] text-black tabular-nums">{item.price}</p>
                </Block>

                {wornIn.length > 0 && (
                    <Block>
                        <p className={`${LABEL} mb-2`}>Worn in</p>
                        <ul className="space-y-1">
                            {wornIn.map((project) => (
                                <li key={project.slug}>
                                    <Link
                                        href={`/projects/${project.slug}`}
                                        className="text-[13px] text-zinc-700 hover:underline underline-offset-2"
                                    >
                                        {project.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </Block>
                )}

                {/* Made-to-order lead time — 설명을 열기 전에 제작 기간부터 보이게. */}
                <Block>
                    <p className={`${LABEL} mb-2`}>Made to Order</p>
                    <p className={BODY}>
                        결제 후 영업일 기준 4–6일 내에 제작이 완료되며 순차 배송됩니다.
                    </p>
                </Block>

                {item.material && (
                    <Block>
                        <button
                            type="button"
                            onClick={() => setIsDescriptionOpen((o) => !o)}
                            className={`${LABEL} w-full flex justify-between items-center hover:text-black transition-colors`}
                            aria-expanded={isDescriptionOpen}
                        >
                            <span>Description</span>
                            <ChevronDown
                                size={12}
                                className={`text-zinc-400 transition-transform duration-300 ${isDescriptionOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-500 ease-in-out ${isDescriptionOpen ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}
                        >
                            <p className={`${BODY} whitespace-pre-line`}>
                                {item.material}
                            </p>
                        </div>
                    </Block>
                )}

                <Block>
                    <p className={`${LABEL} mb-2`}>Size</p>
                    <p className={BODY}>One Size</p>
                </Block>

                <Block>
                    <button
                        type="button"
                        data-sound="firm"
                        onClick={handleAddToBag}
                        className={ACTION}
                    >
                        {added ? 'Added to Bag ✓' : 'Add to Bag →'}
                    </button>
                </Block>

                <Block>
                    <button
                        type="button"
                        data-sound="firm"
                        onClick={handleBuyNow}
                        className={ACTION}
                    >
                        Buy Now →
                    </button>
                </Block>

                <Block>
                    <ShareButton
                        title={`CAGE3000 ${item.name}`}
                        className={ACTION}
                    />
                </Block>
            </div>
        </div>
    );
};
