'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { grotesk } from '@/shared/fonts';
import { LOOKBOOK_COLLECTIONS } from '@/shared/constants/lookbook';
import LookbookLightbox from '../lightbox';

const COLLECTION = LOOKBOOK_COLLECTIONS.find((c) => c.slug === 'green');

const galleryImages = COLLECTION.images;

// 스크롤 위치에 따라 블러·스케일이 부드럽게 변하는 갤러리 카드.
// 각 카드가 뷰포트 중앙에 있을 때만 선명해지고, 위·아래로 멀어질수록 흐려진다.
function GalleryCard({ src, index, onClick }) {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        // 카드가 화면 하단에 막 진입하는 순간 progress=0,
        // 화면 상단을 막 빠져나가는 순간 progress=1
        offset: ['start end', 'end start'],
    });
    // 룩북은 제품을 보여주는 곳이라 흐림 없이 또렷하게 — 스크롤 중 아주 옅은 크기 변화만 남긴다.
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.94]);

    return (
        <motion.div
            ref={ref}
            style={{ scale }}
            onClick={onClick}
            className="relative w-full max-w-2xl mx-auto aspect-[3/4] cursor-zoom-in"
        >
            <Image
                src={src}
                alt={`CAGE3000 lookbook ${index + 1}`}
                fill
                placeholder="blur"
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
                priority={index < 2}
            />
        </motion.div>
    );
}

export default function LookbookPage() {
    const [lightbox, setLightbox] = useState(null);

    return (
        <div className="relative bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-40">
            {/* 목록(/lookbook)과 같은 한 줄 — 왼쪽 컬렉션 이름, 오른쪽 공개 날짜. */}
            <div className={`${grotesk.className} px-4 md:px-12 mb-16 md:mb-24 flex justify-between text-[11px] md:text-[13px] font-medium tracking-[0.01em] tabular-nums`}>
                <h1>{COLLECTION.title}</h1>
                <span>{COLLECTION.date}</span>
            </div>
            {/* Image stack — full vertical scroll-driven gallery. */}
            <div className="relative px-4 md:px-8 space-y-24 md:space-y-32">
                {galleryImages.map((img, idx) => (
                    <GalleryCard
                        key={idx}
                        src={img}
                        index={idx}
                        onClick={() => setLightbox(idx)}
                    />
                ))}
            </div>

            {/* 목록(/lookbook)에서 펼친 격자와 같은 크게 보기 — 좌우로 넘길 수 있다. */}
            <LookbookLightbox images={galleryImages} index={lightbox} onIndexChange={setLightbox} title={COLLECTION.title} />
        </div>
    );
}
