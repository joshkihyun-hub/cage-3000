'use client';

import Image from 'next/image';
import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';
import { ShopItemCard } from '@/components/shop-item-card';
import PageContainer from '@/components/page-container';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { motion } from 'framer-motion';

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');

  if (category === 'clothes') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden">
        {/* Crow Image - Pulsing / Floating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative w-64 h-64 md:w-96 md:h-96 mb-8 mix-blend-multiply"
        >
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, -2, 2, 0], scale: [1, 1.02, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-full h-full relative"
          >
            <Image
              src="/clothes_crow.png"
              alt="The Flock"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Text Container */}
        <div className="text-center z-10 flex flex-col gap-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-2xl md:text-4xl font-serif text-black tracking-widest"
          >
            COMING SOON
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-[10px] md:text-xs font-light text-zinc-500 uppercase tracking-[0.3em]"
          >
            New Collection Launching Soon
          </motion.p>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 1.2, ease: "easeInOut" }}
            className="w-16 h-px bg-black mx-auto mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-16">
      {items.map((item) => (
        <ShopItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export default function ShopPage() {
  return (
    <PageContainer>
      <div className="min-h-screen bg-white pt-32 md:pt-40 pb-24">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
          <Suspense fallback={<div className="min-h-[50vh]" />}>
            <ShopContent />
          </Suspense>
        </div>
      </div>
    </PageContainer>
  );
}
