'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT1_ITEMS } from '../../shared/constants/project1-images';

// "FASHION / 2025" 형태의 subtitle에서 연도만 뽑아낸다.
function extractYear(subtitle) {
    const m = String(subtitle || '').match(/\d{4}/);
    return m ? m[0] : '';
}

export default function ProjectsPage() {
    const [activeId, setActiveId] = useState(PROJECT1_ITEMS[0]?.id);
    const activeItem = PROJECT1_ITEMS.find((p) => p.id === activeId);

    return (
        <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-32">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                {/*
                    Left: project list — hover/click to set the active item.
                    Right (lg+): sticky preview pane showing the active project's
                    hero image plus a small title/year caption. Below lg the
                    preview slides in inline under the list instead.
                */}
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
                                            // flex (not inline-flex) keeps the button as a single contiguous block —
                                            // mobile Safari/Chrome render filter:blur on inline-flex with wrapped
                                            // content as horizontal banding (each wrapped line getting its own
                                            // partial blur). transform-gpu pins a compositing layer so the blur
                                            // stays consistent across scroll.
                                            'group flex flex-wrap items-center gap-x-3 md:gap-x-5 gap-y-2 text-left w-full',
                                            'transition-all duration-500 ease-out cursor-pointer transform-gpu',
                                            // Drive the blur off the active state only — touch devices don't have a
                                            // reliable :hover, and iOS Safari's sticky-hover behaviour was leaving
                                            // multiple rows looking 'selected' after taps. State-only makes
                                            // desktop hover / desktop click / mobile tap all converge to the
                                            // same visual outcome.
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

                    {/* === Right column: sticky preview === */}
                    <div className="hidden lg:block lg:sticky lg:top-32">
                        <AnimatePresence mode="wait">
                            {activeItem && (
                                <motion.div
                                    key={activeItem.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                    className="flex flex-col items-start"
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={activeItem.image}
                                        alt={activeItem.title}
                                        className="w-full max-h-[75vh] object-contain"
                                    />
                                    <div className="mt-6 flex items-baseline gap-3">
                                        <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">
                                            {activeItem.subtitle}
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* === Below-lg fallback: inline preview under the list === */}
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
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={activeItem.image}
                                        alt={activeItem.title}
                                        className="w-full max-h-[70vh] object-contain"
                                    />
                                    <p className="mt-4 text-[10px] uppercase tracking-[0.25em] text-zinc-400">
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
