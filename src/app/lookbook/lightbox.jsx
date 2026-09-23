'use client';

import Image from 'next/image';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { grotesk } from '@/shared/fonts';

const EASE = [0.22, 1, 0.36, 1];
const pad = (n) => String(n).padStart(2, '0');

// 룩북 사진 크게 보기 — 흰 바탕 위에 한 장씩.
// ←/→ 키 · 아래쪽 화살표 버튼 · 좌우 스와이프로 넘기고, Esc · Close · 빈 곳을 누르면 닫힌다.
// index가 null이면 닫힌 상태. 넘길 때는 넘기는 방향으로 살짝 밀려나며 바뀐다.
export default function LookbookLightbox({ images, index, onIndexChange, title }) {
    const open = index !== null;
    const [direction, setDirection] = useState(0);
    const total = images.length;

    const go = (step) => {
        if (!open) return;
        setDirection(step);
        onIndexChange((index + step + total) % total);
    };

    // 닫히는 동안(페이드 아웃)에도 마지막 사진이 남아 있도록 보이는 번호를 따로 기억한다.
    const [shown, setShown] = useState(index);
    if (open && shown !== index) setShown(index);
    const current = shown !== null ? images[shown] : null;

    return (
        <Dialog.Root open={open} onOpenChange={(next) => !next && onIndexChange(null)}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-300" />
                <Dialog.Content
                    aria-describedby={undefined}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowRight') go(1);
                        if (e.key === 'ArrowLeft') go(-1);
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) onIndexChange(null); }}
                    className={`${grotesk.className} fixed inset-0 z-[60] flex items-center justify-center focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-300`}
                >
                    <Dialog.Title className="sr-only">
                        {title} — {open ? `${pad(index + 1)} / ${pad(total)}` : ''}
                    </Dialog.Title>

                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                        {current && (
                            <motion.div
                                key={shown}
                                custom={direction}
                                variants={{
                                    enter: (d) => ({ opacity: 0, x: d * 48 }),
                                    center: { opacity: 1, x: 0 },
                                    exit: (d) => ({ opacity: 0, x: d * -48 }),
                                }}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.5, ease: EASE }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.25}
                                onDragEnd={(_, info) => {
                                    if (info.offset.x < -60) go(1);
                                    else if (info.offset.x > 60) go(-1);
                                }}
                                className="relative cursor-grab active:cursor-grabbing touch-pan-y"
                            >
                                <Image
                                    src={current}
                                    alt={`${title} lookbook ${shown + 1}`}
                                    placeholder="blur"
                                    sizes="92vw"
                                    priority
                                    draggable={false}
                                    className="block w-auto h-auto max-w-[92vw] max-h-[80vh] md:max-h-[84vh] select-none"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Dialog.Close className="absolute top-5 right-5 md:top-8 md:right-10 text-[11px] md:text-[12px] font-medium uppercase tracking-[0.08em] text-zinc-500 hover:text-black transition-colors">
                        Close
                    </Dialog.Close>

                    <div className="absolute bottom-5 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 text-[11px] md:text-[12px] font-medium tracking-[0.04em] tabular-nums">
                        <button type="button" onClick={() => go(-1)} aria-label="Previous" className="px-2 py-1 text-zinc-500 hover:text-black transition-colors">←</button>
                        <span>{open ? `${pad(index + 1)} / ${pad(total)}` : ''}</span>
                        <button type="button" onClick={() => go(1)} aria-label="Next" className="px-2 py-1 text-zinc-500 hover:text-black transition-colors">→</button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
