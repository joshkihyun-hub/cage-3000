'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT1_ITEMS } from '../../shared/constants/project1-images';

// "FASHION / 2025" 형태의 subtitle에서 연도만 뽑아낸다.
function extractYear(subtitle) {
    const m = String(subtitle || '').match(/\d{4}/);
    return m ? m[0] : '';
}

// 가로 스냅 캐러셀.
// • 컨테이너에서 가로로 스크롤(또는 스와이프)하면 자식 이미지가 한 폭씩 스냅.
// • 스냅된(현재 활성) 이미지만 blur-none, 나머지는 blur-md.
// • 컨테이너 너비를 기준으로 activeIdx 계산 → CSS 클래스 토글로 부드럽게 전환.
function ImageCarousel({ images }) {
    const containerRef = useRef(null);
    const [activeIdx, setActiveIdx] = useState(0);

    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const idx = Math.round(el.scrollLeft / el.offsetWidth);
        setActiveIdx((prev) => (prev === idx ? prev : idx));
    }, []);

    return (
        <div>
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {images.map((src, idx) => (
                    <div
                        key={`${src}-${idx}`}
                        className="snap-center shrink-0 w-full flex items-center justify-center"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={`detail ${idx + 1}`}
                            className={[
                                'max-h-[70vh] w-auto object-contain transform-gpu',
                                'transition-all duration-500 ease-out',
                                activeIdx === idx ? 'blur-none' : 'blur-md',
                            ].join(' ')}
                        />
                    </div>
                ))}
            </div>

            {/* 페이지네이션 도트 — 활성은 가로로 늘어난 pill. */}
            {images.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                    {images.map((_, idx) => (
                        <span
                            key={idx}
                            className={[
                                'h-1 rounded-full transition-all duration-300',
                                activeIdx === idx ? 'w-6 bg-zinc-900' : 'w-1.5 bg-zinc-300',
                            ].join(' ')}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ProjectsPage() {
    const [activeId, setActiveId] = useState(PROJECT1_ITEMS[0]?.id);
    const activeItem = PROJECT1_ITEMS.find((p) => p.id === activeId);

    // 캐러셀에 넘길 이미지 — subImages가 있으면 그걸 쓰고, 없으면 메인 이미지 1장.
    const carouselImages = activeItem
        ? (activeItem.subImages && activeItem.subImages.length > 0
            ? activeItem.subImages
            : [activeItem.image])
        : [];

    return (
        <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-32">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-12 lg:gap-20 items-start">
                    {/* === Left column: project list === */}
                    <ul className="space-y-2 md:space-y-4">
                        {PROJECT1_ITEMS.map((item) => {
                            const year = extractYear(item.subtitle);
                            const isActive = item.id === activeId;
                            return (
                                <li key={item.id}>
                                    <button
                                        type="button"
                                        onMouseEnter={() => setActiveId(item.id)}
                                        onClick={() => setActiveId(item.id)}
                                        className={[
                                            'group flex flex-wrap items-center gap-x-3 md:gap-x-5 gap-y-2 text-left w-full',
                                            'transition-all duration-500 ease-out cursor-pointer transform-gpu',
                                            isActive ? 'blur-none' : 'blur-sm',
                                        ].join(' ')}
                                    >
                                        <span className="font-sans text-2xl md:text-3xl lg:text-4xl leading-none tracking-tight text-black">
                                            {item.title}
                                        </span>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-8 md:h-10 lg:h-12 w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                                        />
                                        {year && (
                                            <span className="font-sans text-base md:text-xl lg:text-2xl text-zinc-400 leading-none">
                                                {year}
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* === Right column (lg+): sticky horizontal-swipe carousel === */}
                    <div className="hidden lg:block lg:sticky lg:top-32">
                        <AnimatePresence mode="wait">
                            {activeItem && (
                                <motion.div
                                    key={activeItem.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                >
                                    <ImageCarousel images={carouselImages} />
                                    <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-zinc-400 text-center">
                                        {activeItem.subtitle}
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* === Below-lg fallback: carousel inline under the list === */}
                    {activeItem && (
                        <div className="lg:hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeItem.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                >
                                    <ImageCarousel images={carouselImages} />
                                    <p className="mt-6 text-[10px] uppercase tracking-[0.25em] text-zinc-400 text-center">
                                        {activeItem.subtitle}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
