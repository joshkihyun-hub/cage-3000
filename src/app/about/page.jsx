'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const fadeUp = {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
};

const ease = [0.19, 1, 0.22, 1];

export default function AboutPage() {
    return (
        <div className="bg-white text-zinc-900 min-h-screen font-sans">
            <section className="max-w-screen-md mx-auto px-6 md:px-12 pt-40 md:pt-48 pb-40 md:pb-48 flex flex-col items-center">

                {/* Profile Picture (Vertical Rectangular Archival Print) */}
                <motion.div
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 1.2, delay: 0.15, ease }}
                    className="relative w-56 h-72 md:w-64 md:h-80 overflow-hidden border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                >
                    <Image
                        src="/about_profile.png"
                        alt="Kihyun Kim"
                        fill
                        className="object-cover object-[38%_center] grayscale brightness-[0.98] contrast-[1.02] transition-transform duration-700 hover:scale-105"
                        priority
                    />
                </motion.div>

                {/* Description (Creative Ghost / Double-Exposure Text Layer) */}
                <motion.div
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 1.2, delay: 0.35, ease }}
                    className="relative max-w-sm md:max-w-md mx-auto mt-20 md:mt-24 text-center select-none"
                >
                    {/* Ghost Offset Layer (Artistic Print Misregistration) */}
                    <p className="absolute left-[-10px] right-[10px] top-0 text-zinc-200/70 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider pointer-events-none">
                        A studio working between garment, shelter, and gesture, in Seoul.
                    </p>
                    {/* Main Text Layer */}
                    <p className="relative text-zinc-900 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider z-10">
                        A studio working between garment, shelter, and gesture, in Seoul.
                    </p>
                </motion.div>

                {/* Archival Metadata Section (Three-Pillar Architectural Columns) */}
                <motion.div
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 1.2, delay: 0.55, ease }}
                    className="mt-20 md:mt-24 flex flex-wrap items-center justify-center gap-x-16 md:gap-x-24 gap-y-3 w-full mx-auto text-center"
                >
                    <span className="text-zinc-900 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider">
                        CAGE3000
                    </span>

                    <a
                        href="https://instagram.com/cage3k"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-900 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider hover:text-black border-b border-transparent hover:border-black transition-colors"
                    >
                        @cage3k
                    </a>

                    <a
                        href="mailto:contact@cage3000.com"
                        className="text-zinc-900 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider hover:text-black border-b border-transparent hover:border-black transition-colors"
                    >
                        contact@cage3000.com
                    </a>
                </motion.div>

            </section>
        </div>
    );
}
