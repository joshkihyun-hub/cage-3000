'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT1_ITEMS } from '../../shared/constants/project1-images';

// "FASHION / 2025" 형태의 subtitle에서 연도만 뽑아낸다.
function extractYear(subtitle) {
    const m = String(subtitle || '').match(/\d{4}/);
    return m ? m[0] : '';
}

// 카드 폭(컨테이너 비율). 82%면 양옆으로 9%씩 이전/다음 이미지가 흐릿하게 peek 된다.
const CARD_WIDTH_PCT = 82;
const GAP_PX = 20;
const MAX_BLUR = 12;   // 중앙에서 한 칸 벗어났을 때의 흐림(px)
const DEADZONE = 0.12; // 중앙 ±12% 안에서는 완전히 선명 — 정착 시 흔들림 방지

// 가로 스냅 캐러셀.
// • 스와이프(모바일)·트랙패드·화살표(데스크탑 hover)로 한 장씩 스냅 이동.
// • 양옆에 다음/이전 이미지가 흐릿하게 보였다가, 중앙으로 오면 선명해진다.
// • 흐림/스케일/투명도는 스크롤 위치(중앙으로부터의 거리)로 직접 계산해 매 프레임 갱신하므로
//   React 재랜더 없이 부드럽게 흐르고, 정지 시 항상 중앙 한 장만 또렷하다.
// • 페이지 도트/카운터는 없다 — 흐림 자체가 "더 있다"는 예고.
function ImageCarousel({ images }) {
    const containerRef = useRef(null);
    const cardRefs = useRef([]);
    const rafRef = useRef(0);
    const [activeIdx, setActiveIdx] = useState(0);
    const total = images.length;

    // 각 카드 중심이 뷰포트 중앙에서 얼마나 떨어졌는지로 blur/scale/opacity를 직접 칠한다.
    const paint = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;
        const contRect = el.getBoundingClientRect();
        const contCenter = contRect.left + contRect.width / 2;
        let nearest = 0;
        let nearestDist = Infinity;

        cardRefs.current.forEach((card, idx) => {
            if (!card) return;
            const r = card.getBoundingClientRect();
            const cardCenter = r.left + r.width / 2;
            const dist = Math.abs(cardCenter - contCenter) / (r.width + GAP_PX);
            const t = Math.min(Math.max((dist - DEADZONE) / (1 - DEADZONE), 0), 1);
            const img = card.firstElementChild;
            if (img) {
                img.style.filter = `blur(${(t * MAX_BLUR).toFixed(2)}px)`;
                img.style.transform = `scale(${(1 - t * 0.1).toFixed(3)})`;
                img.style.opacity = (1 - t * 0.5).toFixed(3);
            }
            if (dist < nearestDist) {
                nearestDist = dist;
                nearest = idx;
            }
        });
        setActiveIdx((prev) => (prev === nearest ? prev : nearest));
    }, []);

    // 스크롤은 rAF로 한 프레임당 한 번만 칠하도록 묶는다.
    const handleScroll = useCallback(() => {
        if (rafRef.current) return;
        rafRef.current = requestAnimationFrame(() => {
            rafRef.current = 0;
            paint();
        });
    }, [paint]);

    // 마운트(이미지 교체 포함)·리사이즈 시 초기 포커스 1회 계산.
    useEffect(() => {
        paint();
        const onResize = () => paint();
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [paint, total]);

    const scrollToIdx = (idx) => {
        const card = cardRefs.current[idx];
        if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
                    <div
                        key={`${src}-${idx}`}
                        ref={(node) => { cardRefs.current[idx] = node; }}
                        className="snap-center shrink-0 flex items-center justify-center"
                        style={{ width: `${CARD_WIDTH_PCT}%` }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt={`detail ${idx + 1}`}
                            draggable={false}
                            onLoad={paint}
                            style={{ willChange: 'filter, transform' }}
                            className="max-h-[70vh] w-auto object-contain transform-gpu select-none"
                        />
                    </div>
                ))}
            </div>

            {/* Prev/Next 화살표 — desktop hover에서만 옅게 등장 (모바일은 스와이프). */}
            {total > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => scrollToIdx(activeIdx - 1)}
                        disabled={!hasPrev}
                        aria-label="Previous image"
                        className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white/70 backdrop-blur-sm text-zinc-900 text-lg opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity duration-300 disabled:cursor-default rounded-full z-10"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        onClick={() => scrollToIdx(activeIdx + 1)}
                        disabled={!hasNext}
                        aria-label="Next image"
                        className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center bg-white/70 backdrop-blur-sm text-zinc-900 text-lg opacity-0 group-hover:opacity-100 disabled:opacity-0 transition-opacity duration-300 disabled:cursor-default rounded-full z-10"
                    >
                        ›
                    </button>
                </>
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
                                            'group flex flex-nowrap md:flex-wrap items-center gap-x-2 md:gap-x-5 gap-y-2 text-left w-full',
                                            'transition-all duration-500 ease-out cursor-pointer transform-gpu',
                                            isActive ? 'blur-none' : 'blur-sm',
                                        ].join(' ')}
                                    >
                                        <span className="font-sans text-[15px] md:text-3xl lg:text-4xl leading-none tracking-tight text-black truncate min-w-0">
                                            {item.title}
                                        </span>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="h-6 md:h-10 lg:h-12 w-auto shrink-0 object-contain transition-transform duration-700 group-hover:scale-105"
                                        />
                                        {year && (
                                            <span className="font-sans text-[12px] md:text-xl lg:text-2xl text-zinc-400 leading-none shrink-0">
                                                {year}
                                            </span>
                                        )}
                                    </button>

                                    {/* Mobile-only: carousel appears directly under the tapped title */}
                                    {isActive && (
                                        <div className="lg:hidden mt-6 mb-8">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={item.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                                >
                                                    <ImageCarousel images={carouselImages} />
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>
                                    )}
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
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
}
