'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const ImageCard = ({ item }) => {
  return (
    <Link href={`/details/${item.id}`} className="block w-full">
      <motion.div
        className="relative overflow-hidden aspect-[3/4] bg-white cursor-pointer group will-change-transform"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {/* Main Image Container - Slow Cinematic Zoom */}
        <motion.div
          className="absolute inset-0 z-10 will-change-transform"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.05 }
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} // Slow ease out
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </motion.div>

        {/* Hover Image (Cinematic Crossfade) */}
        {item.image_hover && (
          <motion.div
            className="absolute inset-0 z-10 will-change-transform"
            variants={{
              rest: { opacity: 0, scale: 1 },
              hover: { opacity: 1, scale: 1.05 }
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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

        {/* Darkening Overlay (Luxurious Feel) */}
        <motion.div
          className="absolute inset-0 bg-black/40 z-20 pointer-events-none"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 }
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Text Reveal (Elegant Slide Up) */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none px-4 text-center">
          <motion.div
            variants={{
              rest: { y: 20, opacity: 0, filter: "blur(4px)" },
              hover: { y: 0, opacity: 1, filter: "blur(0px)" }
            }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-white font-serif text-xs md:text-sm uppercase tracking-[0.3em] font-light">
              View Project
            </span>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};