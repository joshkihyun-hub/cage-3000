'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const mainImage = '/asset/details/lookbook/9hat/A1.jpg';

const galleryImages = [
    '/asset/details/lookbook/9hat/A1.jpg',
    '/asset/details/lookbook/9hat/A2.jpg',
    '/asset/details/lookbook/9hat/A3.jpeg',
    '/asset/details/lookbook/9hat/B1.jpg',
    '/asset/details/lookbook/9hat/B3.jpg',
    '/asset/details/lookbook/9hat/C1.jpg',
    '/asset/details/lookbook/9hat/C2.jpg',
    '/asset/details/lookbook/9hat/D1.jpg',
    '/asset/details/lookbook/9hat/D2.jpg',
    '/asset/details/lookbook/9hat/D3.jpg',
    '/asset/details/lookbook/9hat/E1.jpeg',
    '/asset/details/lookbook/9hat/E2.jpg',
    '/asset/details/lookbook/9hat/E3.jpg',
    '/asset/details/lookbook/9hat/F1.jpg',
    '/asset/details/lookbook/9hat/F2.jpg',
    '/asset/details/lookbook/9hat/G1.jpg',
    '/asset/details/lookbook/9hat/G2.jpg',
    '/asset/details/lookbook/9hat/H1.jpg',
    '/asset/details/lookbook/9hat/H2.jpg',
    '/asset/details/lookbook/9hat/H3.jpg',
];

export default function LookbookPage() {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const galleryRef = useRef(null);

    const handleMainImageClick = () => {
        setIsGalleryOpen(true);
        setTimeout(() => {
            galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="bg-white text-zinc-900 min-h-screen">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row min-h-screen">
                {/* Left: Main Image */}
                <div
                    className="w-full md:w-1/2 h-[60vh] md:h-screen relative cursor-pointer group overflow-hidden"
                    onClick={handleMainImageClick}
                >
                    <Image
                        src={mainImage}
                        alt="Inner Weather Main"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                        <span className="text-white text-xs uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            View Collection
                        </span>
                    </div>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-1/2 min-h-[40vh] md:h-screen flex flex-col justify-center px-8 md:px-24 bg-white py-12 md:py-0 relative">
                    <div className="max-w-md">
                        <div className="flex items-end gap-6 mb-8">
                            <h1 className="font-serif text-4xl md:text-7xl text-black leading-tight">
                                Inner<br />Weather
                            </h1>
                            <div className="absolute -top-20 right-4 w-32 h-32 md:static md:w-48 md:h-48 md:mb-2 opacity-80 z-10">
                                <Image
                                    src="/kl.png"
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <div className="space-y-6 text-sm md:text-base leading-relaxed text-zinc-600 font-light">
                            <p>
                                I crafted nine hats. Wearing them, I experienced subtle shifts in emotion and gait.
                            </p>
                            <p>
                                Fascinated by the gestures that embody these feelings and their nuances,
                                I designed each piece to represent a distinct emotion.
                            </p>
                            <p>
                                Titled 'Inner Weather,' this collection marks the debut of cage3000.
                            </p>
                        </div>
                        {!isGalleryOpen && (
                            <button
                                onClick={handleMainImageClick}
                                className="mt-12 text-xs uppercase tracking-[0.2em] text-black border-b border-black pb-1 hover:text-zinc-600 hover:border-zinc-600 transition-colors"
                            >
                                View Lookbook
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <AnimatePresence>
                {isGalleryOpen && (
                    <motion.div
                        ref={galleryRef}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="container mx-auto px-4 py-24"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {galleryImages.map((src, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    className={`relative ${index % 3 === 0 ? 'aspect-[3/4]' :
                                        index % 3 === 1 ? 'aspect-[4/5]' : 'aspect-[3/4]'
                                        } w-full bg-zinc-50 cursor-pointer group`}
                                    onClick={() => setSelectedImage(src)}
                                >
                                    <Image
                                        src={src}
                                        alt={`Lookbook Image ${index + 1}`}
                                        fill
                                        className="object-cover hover:scale-[1.02] transition-transform duration-700"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-24 text-center">
                            <p className="font-serif text-2xl text-black mb-4">cage3000</p>
                            <p className="text-xs uppercase tracking-widest text-zinc-400">Seoul, South Korea</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-50 bg-white/95 flex items-center justify-center p-4 md:p-12 cursor-pointer"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative w-full h-full max-w-5xl max-h-[90vh]">
                            <Image
                                src={selectedImage}
                                alt="Enlarged view"
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                        </div>
                        <button
                            className="absolute top-8 right-8 text-black hover:text-zinc-600 transition-colors z-50 p-2"
                            onClick={() => setSelectedImage(null)}
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
