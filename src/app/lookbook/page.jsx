'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Static Imports for Image Optimization
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

const mainImage = A1; // Use imported image

const galleryImages = [
    A1, A2, A3, B1, B3, C1, C2, D1, D2, D3, E1, E2, E3, F1, F2, G1, G2, H1, H2, H3
];

export default function LookbookPage() {
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const galleryRef = useRef(null);


    useEffect(() => {
        if (isGalleryOpen && galleryRef.current) {
            // Slight delay to ensure layout is ready
            setTimeout(() => {
                galleryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [isGalleryOpen]);

    const handleMainImageClick = () => {
        setIsGalleryOpen(true);
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
                        placeholder="blur" // Enable blur placeholder
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
                    <div className="max-w-md relative">
                        <div className="flex items-end gap-6 mb-8">
                            <h1 className="font-serif text-4xl md:text-7xl text-black leading-tight">
                                green
                            </h1>
                            <div className="absolute -top-20 right-4 w-32 h-32 md:static md:w-72 md:h-72 md:mb-4 md:translate-x-8 opacity-90 z-10 pointer-events-none">
                                <Image
                                    src="/kl.png"
                                    alt="Logo"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        <div className="mt-8 space-y-1 text-xs text-zinc-400 font-light tracking-wide">
                            <p>Design, Production: @choppycocky</p>
                            <p>Photography: @youngikyoun</p>
                            <p>Styling: @bluevereal</p>
                            <p>Model: @simleeje @choppycocky</p>
                        </div>
                        {!isGalleryOpen && (
                            <button
                                onClick={handleMainImageClick}
                                className="mt-12 text-xs uppercase tracking-[0.2em] text-black border-b border-black pb-1 hover:text-zinc-600 hover:border-zinc-600 transition-colors relative z-20 cursor-pointer"
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
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="container mx-auto px-4"
                    >
                        <div className="py-24">

                            {/* Masonry Layout using CSS Columns */}
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-8 space-y-4 md:space-y-8">
                                {galleryImages.map((imgData, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1, duration: 0.6 }}
                                        className="relative w-full break-inside-avoid bg-zinc-50 cursor-pointer group"
                                        onClick={() => setSelectedImage(imgData)}
                                    >
                                        <Image
                                            src={imgData}
                                            alt={`Lookbook Image ${index + 1}`}
                                            // Make next/image responsive within CSS columns
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            placeholder="blur"
                                            style={{
                                                width: '100%',
                                                height: 'auto',
                                            }}
                                            className="hover:brightness-90 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="mt-24 text-center">
                                <p className="font-serif text-2xl text-black mb-4">cage3000</p>
                                <p className="text-xs uppercase tracking-widest text-zinc-400">Seoul, South Korea</p>
                            </div>
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
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // Apple-like spring easing
                                className="relative w-full h-full"
                            >
                                <Image
                                    src={selectedImage}
                                    alt="Enlarged view"
                                    fill
                                    className="object-contain"
                                    sizes="100vw"
                                    priority
                                />
                            </motion.div>
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
