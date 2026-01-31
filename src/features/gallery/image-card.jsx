'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const ImageCard = ({ item }) => {
  return (
    <Link href={`/details/${item.id}`} className="block w-full">
      <motion.div
        className="relative overflow-hidden aspect-[3/4] bg-zinc-100 cursor-pointer group will-change-transform"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {/* Main Image Container - Gunshot Zoom (Instant Snap) */}
        <motion.div
          className="absolute inset-0 z-10 will-change-transform"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.05 }
          }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }} // Optimized stiffness
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </motion.div>

        {/* Hover Image (Instant Cut) - Optional, only if item.image_hover exists */}
        {item.image_hover && (
          <motion.div
            className="absolute inset-0 z-10 will-change-transform"
            variants={{
              rest: { opacity: 0, scale: 1 },
              hover: { opacity: 1, scale: 1.05 }
            }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Image
              src={item.image_hover}
              alt={`${item.title} hover`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </motion.div>
        )}

        {/* WHITE FLASH Overlay (Lightning Effect) - Simplified opacity fade */}
        <motion.div
          className="absolute inset-0 bg-white z-20 pointer-events-none"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: [0.6, 0] } // Flash from bright to transparent
          }}
          transition={{ duration: 0.15 }} // Very fast flash
        />

        {/* Text Reveal (Hard Cut / Glitchy) */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <motion.div
            variants={{
              rest: { opacity: 0, scale: 0.9 },
              hover: { opacity: 1, scale: 1 }
            }}
            transition={{ duration: 0.05 }} // Instant appearance
          >
            <span className="text-white font-black italic text-2xl uppercase tracking-tighter drop-shadow-md">
              View Project
            </span>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};