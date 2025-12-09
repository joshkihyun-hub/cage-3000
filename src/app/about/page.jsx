'use client';

import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="bg-white text-zinc-900 min-h-screen">
            <div className="flex flex-col md:flex-row min-h-screen">
                {/* Left: Image */}
                <div className="w-full md:w-1/2 h-[60vh] md:h-screen relative">
                    <Image
                        src="/IMG_1399.png"
                        alt="About cage3000"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 py-16 md:py-0 bg-white">
                    <div className="max-w-md">


                        <div className="space-y-8 text-sm md:text-base leading-relaxed text-zinc-600 font-light">
                            <p className="text-xl md:text-2xl font-medium text-black italic">
                                "No room for boring"
                            </p>
                            <div className="pt-8 text-sm text-zinc-500 font-light">
                                <p>Cage3000 Director Kihyun Kim based in Seoul</p>
                                <div className="flex gap-4 mt-2">
                                    <a href="https://instagram.com/cage3k" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                                        @cage3k
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
