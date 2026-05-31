'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { PROJECT1_ITEMS } from '../../shared/constants/project1-images';

// "FASHION / 2025" 형태의 subtitle에서 연도만 뽑아낸다.
function extractYear(subtitle) {
    const m = String(subtitle || '').match(/\d{4}/);
    return m ? m[0] : '';
}

// 카드 폭(컨테이너 비율) — 78%면 양옆에 11%씩 다음/이전 이미지 peek가 보임.
const CARD_WIDTH_PCT = 78;
const GAP_PX = 16;

// 가로 스냅 캐러셀 카드 — 컨테이너 가로 스크롤 진행도(0→1)에 따라 blur를 연속적으로
// 변화시킨다. 중앙(progress 0.45~0.55)에서만 선명, 양 끝으로 갈수록 16px까지 흐려짐.
// (룩북 세로 갤러리의 패턴을 X축으로 회전한 형태.)
function CarouselCard({ src, idx, containerRef }) {
    const ref = useRef(null);
    const { scrollXProgress } = useScroll({
        container: containerRef,
        target: ref,
        offset: ['start end', 'end start'],
    });
    const blurValue = useTransform(scrollXProgress, [0, 0.45, 0.55, 1], [16, 0, 0, 16]);
    const filter = useTransform(blurValue, (b) => `blur(${b}px)`);

    return (
        <div
            ref={ref}
            className="snap-center shrink-0 flex items-center justify-center"
            style={{ width: `${CARD_WIDTH_PCT}%` }}
        >
            {/* motion.img: framer-motion이 MotionValue로 style을 직접 갱신해서
                매 스크롤 프레임마다 React 재랜더 없이 부드럽게 흐림이 변한다. */}
            <motion.img
                src={src}
                alt={`detail ${idx + 1}`}
                style={{ filter, willChange: 'filter' }}
                className="max-h-[65vh] w-auto object-contain transform-gpu"
            />
        </div>
    );
}

// 가로 캐러셀 컨테이너 — 좌우 padding으로 첫·마지막 카드도 중앙 정렬, snap으로 한 카드씩 정착.
function ImageCarousel({ images }) {
    const containerRef = useRef(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const total = images.length;

    const handleScroll = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const cardW = (el.offsetWidth * CARD_WIDTH_PCT) / 100;
        const stride = cardW + GAP_PX;
        const idx = Math.round(el.scrollLeft / stride);
        setActiveIdx((prev) => (prev === idx ? prev : idx));
    }, []);

    const scrollToIdx = (idx) => {
        const el = containerRef.current;
        if (!el) return;
        const cardW = (el.offsetWidth * CARD_WIDTH_PCT) / 100;
        const stride = cardW + GAP_PX;
        el.scrollTo({ left: idx * stride, behavior: 'smooth' });
    };

    const hasPrev = activeIdx > 0;
    const hasNext = activeIdx < total - 1;

    return (
        <div className="relative group">
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{
                    paddingLeft: `${(100 - CARD_WIDTH_PCT) / 2}%`,
                    paddingRight: `${(100 - CARD_WIDTH_PCT) / 2}%`,
                    gap: `${GAP_PX}px`,
                }}
            >
                {images.map((src, idx) => (
                    <CarouselCard
                        key={`${src}-${idx}`}
                        src={src}
                        idx={idx}
                        containerRef={containerRef}
                    />
                ))}
            </div>

            {/* Prev/Next 화살표 — desktop hover에서 등장 (모바일은 스와이프). */}
            {total > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => scrollToIdx(activeIdx - 1)}
                        disabled={!hasPrev}
                        aria-label="Previous image"
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/85 backdrop-blur-sm text-zinc-900 text-lg opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity disabled:cursor-default rounded-full shadow-sm z-10"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollToIdx(activeIdx + 1)}
                        disabled={!hasNext}
                        aria-label="Next image"
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/85 backdrop-blur-sm text-zinc-900 text-lg opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity disabled:cursor-default rounded-full shadow-sm z-10"
                    >
                        ›
                    </button>
                </>
            )}

            {/* 카운터 + 클릭 가능한 도트. 다중 이미지일 때만 표시. */}
            {total > 1 && (
                <div className="flex flex-col items-center gap-3 mt-5">
                    <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-400 tabular-nums">
                        {String(activeIdx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                    </p>
                    <div className="flex justify-center gap-1.5">
                        {images.map((_, idx) => (
                            <button
                                type="button"
                                key={idx}
                                onClick={() => scrollToIdx(idx)}
                                aria-label={`Go to image ${idx + 1}`}
                                className={[
                                    'h-1 rounded-full transition-all duration-300 cursor-pointer',
                                    activeIdx === idx ? 'w-6 bg-zinc-900' : 'w-2 bg-zinc-300 hover:bg-zinc-500',
                                ].join(' ')}
                            />
                        ))}
                    </div>
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
