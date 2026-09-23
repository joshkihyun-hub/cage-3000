'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { grotesk } from '@/shared/fonts';

// `priority` should only be true for above-the-fold cards (e.g. the first grid
// row on /shop). Marking every card priority forces the browser to preload all
// nine primary images at once, starving the actual LCP image.
export const ShopItemCard = ({ item, priority = false }) => {
    // Default to displaying the first image (index 0)
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);

    // Prepare the list of images to render. 
    // If item.images exists and has items, use it. Otherwise fallback to [item.imageUrl].
    const imagesToRender = (item.images && item.images.length > 0)
        ? item.images
        : [item.imageUrl];

    // Track if the user has hovered to lazy-load secondary images
    const [hasHovered, setHasHovered] = useState(false);

    const handleMouseEnter = () => {
        if (!hasHovered) setHasHovered(true);
    };

    const handleMouseMove = (e) => {
        if (imagesToRender.length <= 1) return;
        // Ensure secondary images are loaded if they haven't been already
        if (!hasHovered) setHasHovered(true);

        const { left, width } = containerRef.current.getBoundingClientRect();
        // Calculate relative X position (0 to 1)
        const x = e.clientX - left;
        const percentage = Math.max(0, Math.min(1, x / width));

        // Calculate index based on percentage
        const index = Math.min(
            imagesToRender.length - 1,
            Math.floor(percentage * imagesToRender.length)
        );

        setCurrentIndex(index);
    };

    const handleMouseLeave = () => {
        setCurrentIndex(0);
    };

    return (
        <Link href={`/shop/${item.id}`} className="group cursor-pointer flex flex-col h-full">
            <div
                ref={containerRef}
                onMouseEnter={handleMouseEnter}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative aspect-[3/4] bg-white mb-4 overflow-hidden"
            >
                {/* Always render the primary image (index 0) */}
                <div
                    className={`absolute inset-0 transition-opacity duration-150 ease-out ${currentIndex === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    <Image
                        src={imagesToRender[0]}
                        alt={`${item.name} - view 1`}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover object-center"
                        priority={priority}
                    />
                </div>

                {/* Render secondary images ONLY after first hover */}
                {hasHovered && imagesToRender.slice(1).map((imgSrc, idx) => (
                    <div
                        key={`${item.id}-img-${idx + 1}`}
                        className={`absolute inset-0 transition-opacity duration-150 ease-out ${idx + 1 === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        <Image
                            src={imgSrc}
                            alt={`${item.name} - view ${idx + 2}`}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover object-center"
                            priority={false}
                        />
                    </div>
                ))}

                {/* Hover overlay (View button) */}
                <div className="absolute inset-0 z-20 flex items-center justify-center text-white font-light text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20 pointer-events-none">
                    VIEW
                </div>
            </div>

            <div className="mt-auto flex justify-between items-end">
                {/* 번호와 가격은 한 세트 — About·Projects와 같은 그로테스크, 같은 크기.
                    번호는 옅게, 가격은 또렷하게. 숫자 폭을 고르게(tabular-nums) 맞추고
                    모바일은 한 단계 작게, 자간은 살짝 벌려 숫자가 붙어 보이지 않게. */}
                <div className={`${grotesk.className} select-none text-[11px] md:text-[12px] font-medium leading-[1.4] tracking-[0.02em] md:tracking-[0.01em] tabular-nums`}>
                    <h3 className="text-zinc-400">{item.name}</h3>
                    <p className="text-black">{item.price}</p>
                </div>
                <div className="w-2 h-2 bg-black rounded-full mb-1 shrink-0"></div>
            </div>
        </Link>
    );
};
