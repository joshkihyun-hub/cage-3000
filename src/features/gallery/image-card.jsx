'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

export const ImageCard = ({ item }) => {
  return (
    <Link href={`/details/${item.id}`} className="block w-full">
      <motion.div
        className="relative overflow-hidden aspect-[3/4] bg-zinc-100 cursor-pointer group"
        initial="rest"
        whileHover="hover"
        animate="rest"
      >
        {/* Main Image Container - Slow Zoom */}
        <motion.div
          className="absolute inset-0 z-10"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.1 }
          }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </motion.div>

        {/* Hover Image (Crossfade) - Optional, only if item.image_hover exists */}
        {item.image_hover && (
          <motion.div
            className="absolute inset-0 z-10"
            variants={{
              rest: { opacity: 0, scale: 1 },
              hover: { opacity: 1, scale: 1.1 }
            }}
            transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
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

        {/* Dark Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/20 z-20 pointer-events-none"
          variants={{
            rest: { opacity: 0 },
            hover: { opacity: 1 }
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Text Reveal */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <motion.div
            variants={{
              rest: { y: 20, opacity: 0 },
              hover: { y: 0, opacity: 1 }
            }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-white font-serif italic text-xl tracking-wider">
              View Project
            </span>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
};