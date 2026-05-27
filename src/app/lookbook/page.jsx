'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

// Static imports — placeholder="blur" + next/image optimization rely on these.
import A1 from '../../../public/asset/details/lookbook/9hat/A1.jpg';
import A2 from '../../../public/asset/details/lookbook/9hat/A2.jpg';
import A3 from '../../../public/asset/details/lookbook/9hat/A3.jpeg';
import B1 from '../../../public/asset/details/lookbook/9hat/B1.jpg';
import B3 from '../../../public/asset/details/lookbook/9hat/B3.jpg';
import C1 from '../../../public/asset/details/lookbook/9hat/C1.jpg';
import C2 from '../../../public/asset/details/lookbook/9hat/C2.jpg';
import D1 from '../../../public/asset/details/lookbook/9hat/D1.jpg';
import D2 from '../../../public/asset/details/lookbook/9hat/D2.jpg';
import D3 from '../../../public/asset/details/lookbook/9hat/D3.jpg';
import E1 from '../../../public/asset/details/lookbook/9hat/E1.jpeg';
import E2 from '../../../public/asset/details/lookbook/9hat/E2.jpg';
import E3 from '../../../public/asset/details/lookbook/9hat/E3.jpg';
import F1 from '../../../public/asset/details/lookbook/9hat/F1.jpg';
import F2 from '../../../public/asset/details/lookbook/9hat/F2.jpg';
import G1 from '../../../public/asset/details/lookbook/9hat/G1.jpg';
import G2 from '../../../public/asset/details/lookbook/9hat/G2.jpg';
import H1 from '../../../public/asset/details/lookbook/9hat/H1.jpg';
import H2 from '../../../public/asset/details/lookbook/9hat/H2.jpg';
import H3 from '../../../public/asset/details/lookbook/9hat/H3.jpg';

const galleryImages = [A1, A2, A3, B1, B3, C1, C2, D1, D2, D3, E1, E2, E3, F1, F2, G1, G2, H1, H2, H3];

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
    // 중앙(0.5) 근처에서만 blur 0, 양 끝으로 갈수록 16px까지 흐려짐.
    // 데드존(0.4~0.6)을 두어 중앙에서는 완전히 선명해 보이게.
    const blurValue = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [18, 0, 0, 18]);
    const filter = useTransform(blurValue, (b) => `blur(${b}px)`);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.94]);

    return (
        <motion.div
            ref={ref}
            style={{ filter, scale }}
            onClick={onClick}
            className="relative w-full max-w-2xl mx-auto aspect-[3/4] cursor-zoom-in"
        >
            <Image
                src={src}
                alt={`green lookbook image ${index + 1}`}
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
    const [lightboxImage, setLightboxImage] = useState(null);

    return (
        <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-40">
            {/* Sticky side credit — anchored to the viewport center while you scroll. */}
            <aside className="hidden lg:block fixed left-8 xl:left-12 top-1/2 -translate-y-1/2 z-30 select-none pointer-events-none max-w-[180px]">
                <h1 className="relative text-xl xl:text-2xl leading-none text-black mb-5">
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 -translate-x-[4px] text-zinc-200/70 pointer-events-none"
                    >
                        green
                    </span>
                    <span className="relative">green</span>
                </h1>
                {[
                    ['Design, Production', '@choppycocky'],
                    ['Photography', '@youngikyoun'],
                    ['Styling', '@bluevereal'],
                    ['Model', '@simleeje @choppycocky'],
                ].map(([role, who]) => (
                    <div key={role} className="mt-3 first:mt-0">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 leading-relaxed">
                            {role}
                        </p>
                        <p className="text-[11px] text-zinc-900 font-medium tracking-wide leading-snug mt-0.5">
                            {who}
                        </p>
                    </div>
                ))}
            </aside>

            {/* Mobile / small-screen intro — sits above the gallery instead of being sticky. */}
            <div className="lg:hidden max-w-md mx-auto px-6 mb-16 select-none">
                <h1 className="relative text-3xl leading-tight text-black mb-6">
                    <span
                        aria-hidden="true"
                        className="absolute inset-0 -translate-x-[5px] text-zinc-200/70 pointer-events-none"
                    >
                        green
                    </span>
                    <span className="relative">green</span>
                </h1>
                <div className="space-y-2">
                    {[
                        'Design, Production: @choppycocky',
                        'Photography: @youngikyoun',
                        'Styling: @bluevereal',
                        'Model: @simleeje @choppycocky',
                    ].map((line) => (
                        <p
                            key={line}
                            className="relative text-zinc-900 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider"
                        >
                            <span
                                aria-hidden="true"
                                className="absolute inset-0 -translate-x-[3px] text-zinc-200/70 pointer-events-none"
                            >
                                {line}
                            </span>
                            <span className="relative">{line}</span>
                        </p>
                    ))}
                </div>
            </div>

            {/* Image stack — full vertical scroll-driven gallery. */}
            <div className="px-4 md:px-8 space-y-24 md:space-y-32">
                {galleryImages.map((img, idx) => (
                    <GalleryCard
                        key={idx}
                        src={img}
                        index={idx}
                        onClick={() => setLightboxImage(img)}
                    />
                ))}
            </div>

            {/* Lightbox — single tap opens the focused image at full viewport. */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-white/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
                        onClick={() => setLightboxImage(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-full h-full max-w-5xl max-h-[90vh]"
                        >
                            <Image
                                src={lightboxImage}
                                alt="Enlarged view"
                                fill
                                sizes="100vw"
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                        <button
                            className="absolute top-8 right-8 text-black hover:text-zinc-600 transition-colors z-50 p-2"
                            onClick={(e) => { e.stopPropagation(); setLightboxImage(null); }}
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
