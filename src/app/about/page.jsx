'use client';

import { motion } from 'framer-motion';

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
};

const ease = [0.19, 1, 0.22, 1];

export default function AboutPage() {
    return (
        <div className="bg-white text-zinc-900 min-h-screen">
            <section className="max-w-screen-md mx-auto px-6 md:px-12 pt-40 md:pt-48 pb-32 md:pb-40">
                <motion.p
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 1, ease }}
                    className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-zinc-400 mb-10"
                >
                    About
                </motion.p>

                <motion.h1
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 1.2, delay: 0.15, ease }}
                    className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight text-black"
                >
                    Kihyun Kim
                </motion.h1>

                <motion.p
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 1.2, delay: 0.3, ease }}
                    className="mt-4 font-serif italic text-lg md:text-xl text-zinc-500"
                >
                    Based in Seoul.
                </motion.p>

                <motion.div
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 1.2, delay: 0.5, ease }}
                    className="mt-20 md:mt-24 h-px w-12 bg-zinc-200"
                />

                <motion.dl
                    variants={fadeUp}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 1.2, delay: 0.6, ease }}
                    className="mt-10 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-y-6 sm:gap-y-5 gap-x-10"
                >
                    <dt className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-zinc-400">
                        Studio
                    </dt>
                    <dd className="text-sm md:text-base text-zinc-800 tracking-wide">
                        CAGE3000 / KHN
                    </dd>

                    <dt className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-zinc-400">
                        Instagram
                    </dt>
                    <dd className="text-sm md:text-base">
                        <a
                            href="https://instagram.com/cage3k"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-800 hover:text-black border-b border-transparent hover:border-black transition-colors tracking-wide"
                        >
                            @cage3k
                        </a>
                    </dd>

                    <dt className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-zinc-400">
                        Contact
                    </dt>
                    <dd className="text-sm md:text-base">
                        <a
                            href="mailto:contact@cage3000.com"
                            className="text-zinc-800 hover:text-black border-b border-transparent hover:border-black transition-colors tracking-wide"
                        >
                            contact@cage3000.com
                        </a>
                    </dd>
                </motion.dl>
            </section>
        </div>
    );
}
