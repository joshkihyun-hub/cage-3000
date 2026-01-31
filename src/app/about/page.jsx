'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function AboutPage() {
    return (
        <div className="bg-white text-zinc-900 min-h-screen relative overflow-hidden">

            {/* Crow Illustration - Floating Top Right */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
                className="absolute top-[8%] right-[5%] md:top-[15%] md:right-[15%] w-48 h-48 md:w-96 md:h-96 z-10 opacity-90 mix-blend-multiply"
            >
                <Image
                    src="/about_crow.png"
                    alt="Flying Crow"
                    fill
                    className="object-contain"
                    priority
                />
            </motion.div>

            {/* Scattered Text 1 - Top Left */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.4, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
                className="absolute top-[28%] left-[8%] md:top-[25%] md:left-[15%] z-20"
            >
                <h2 className="font-serif text-lg md:text-xl text-zinc-500 font-light italic tracking-widest leading-relaxed">
                    Until the day
                </h2>
            </motion.div>

            {/* Scattered Text 2 - Overlapping/Middle */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.4, delay: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="absolute top-[55%] left-[15%] md:top-[45%] md:left-[35%] z-20"
            >
                <h2 className="font-serif text-2xl md:text-4xl text-black font-normal tracking-tight leading-none mix-blend-darken">
                    <span className="italic font-light text-zinc-400 mr-2">3000 birds</span>
                    fly us
                </h2>
            </motion.div>


            {/* Scattered Text 3 - Bottom Right */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.4, delay: 0.8, ease: [0.19, 1, 0.22, 1] }}
                className="absolute bottom-[15%] right-[8%] md:bottom-[20%] md:right-[20%] z-20 text-right"
            >
                <h2 className="font-serif text-xl md:text-3xl text-zinc-800 font-light leading-relaxed">
                    into the sky.
                </h2>
                <div className="w-12 h-px bg-zinc-300 ml-auto mt-6 mb-3"></div>
                <p className="text-sm font-serif italic text-zinc-600">
                    Director Kihyun Kim
                </p>
                <a
                    href="https://instagram.com/cage3k"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[9px] uppercase tracking-[0.2em] text-zinc-300 hover:text-black transition-colors mt-1"
                >
                    @cage3k
                </a>
            </motion.div>

        </div>
    );
}
