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
                        <h1 className="font-serif text-4xl md:text-5xl text-black mb-12">
                            About
                        </h1>

                        <div className="space-y-8 text-sm md:text-base leading-relaxed text-zinc-600 font-light">
                            <p>
                                cage3000 explores the subtle shifts in emotion and gesture.
                            </p>
                            <p>
                                We believe that what we wear is an extension of our inner weather—a physical manifestation of the intangible feelings that move through us.
                            </p>
                            <p>
                                Our debut collection, 'Inner Weather', captures these nuances through form and texture, inviting you to experience the delicate balance between the seen and the felt.
                            </p>
                            <p className="pt-8 font-serif text-black text-lg">
                                cage3000
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
