'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { grotesk } from '@/shared/fonts';
import LookbookLightbox from './lightbox';

const label = 'absolute top-1/2 -translate-y-1/2 text-[11px] md:text-[13px] font-medium tracking-[0.01em] tabular-nums';
const pad = (n) => String(n).padStart(2, '0');

// 공개 전 티저의 가장자리 — 사진 모양은 그대로 두고 테두리만 부드럽게 흰 바탕으로 풀어 준다.
// 페이드는 부드러운 곡선(smoothstep)을 촘촘한 단계로 풀어 쓴다 — 단계가 적으면 꺾이는
// 자리마다 네모난 선이 비쳐 보인다. 가로·세로 페더를 겹쳐(intersect) 모서리는 조금 더 둥글게.
const FEATHER_WIDTH = 12; // %
const FEATHER = (() => {
  const steps = Array.from({ length: 13 }, (_, i) => i / 12);
  const ease = (t) => t * t * (3 - 2 * t);
  const fadeIn = steps.map((t) => `rgba(0,0,0,${ease(t).toFixed(3)}) ${(t * FEATHER_WIDTH).toFixed(2)}%`);
  const fadeOut = steps.map((t) => `rgba(0,0,0,${ease(1 - t).toFixed(3)}) ${(100 - FEATHER_WIDTH + t * FEATHER_WIDTH).toFixed(2)}%`);
  return [...fadeIn, ...fadeOut].join(', ');
})();
const FOG_MASK = `linear-gradient(to right, ${FEATHER}), linear-gradient(to bottom, ${FEATHER})`;
const fogStyle = {
  maskImage: FOG_MASK,
  WebkitMaskImage: FOG_MASK,
  maskComposite: 'intersect',
  WebkitMaskComposite: 'source-in',
};

// 펼쳐지는 사진 격자 — 담백하게. 칸마다 옅게 나타나며 6px쯤 떠오를 뿐이고,
// 읽는 순서(왼쪽 → 오른쪽, 위 → 아래)대로 짧게 이어진다.
// 펼칠 때 높이는 애니메이션하지 않는다 — height:auto를 재는 동안 framer가 스크롤 위치를 되돌려
// 격자 쪽으로 내려가는 스크롤을 끊어 버린다.
const SOFT = [0.33, 1, 0.68, 1];

function CollectionGrid({ collection, onOpen }) {
  return (
    <motion.div
      exit={{ height: 0, opacity: 0, transition: { duration: 0.4, ease: SOFT } }}
      className="overflow-hidden"
    >
      <div className="grid grid-cols-3 min-[480px]:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-x-2 gap-y-4 md:gap-x-3 md:gap-y-5 pt-10 md:pt-14 pb-16 md:pb-24">
        {collection.images.map((img, i) => (
          <motion.div
            key={img.src}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: SOFT, delay: 0.1 + i * 0.03 }}
          >
            <button
              type="button"
              onClick={() => onOpen(i)}
              aria-label={`${collection.title} ${pad(i + 1)} 크게 보기`}
              className="group/thumb relative block w-full aspect-[3/4] overflow-hidden bg-zinc-100 cursor-zoom-in"
            >
              <Image
                src={img}
                alt={`${collection.title} lookbook ${i + 1}`}
                fill
                placeholder="blur"
                sizes="(min-width: 1024px) 14vw, (min-width: 768px) 20vw, (min-width: 480px) 25vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover/thumb:scale-[1.03]"
              />
            </button>
            <span className="block mt-1.5 text-[10px] md:text-[11px] font-medium tabular-nums text-zinc-400">
              {pad(i + 1)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// 컬렉션 목록 — 가운데에 대표 이미지 한 장(원본 비율), 왼쪽 끝엔 컬렉션 이름, 오른쪽 끝엔 공개 날짜.
// 사진이 있는 컬렉션을 누르면 그 줄 아래로 격자가 펼쳐지고, 격자의 사진을 누르면 크게 본다.
export default function LookbookIndex({ collections }) {
  const [openSlug, setOpenSlug] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const rowRefs = useRef({});

  const toggle = (slug) => {
    if (openSlug === slug) {
      setOpenSlug(null);
      return;
    }
    setOpenSlug(slug);
    // 펼쳐지는 격자가 화면 안에서 보이도록 그 줄을 헤더 바로 아래로 부드럽게 올린다.
    // 격자가 그려진 다음 프레임에 움직여야 페이지가 충분히 길어져 끝까지 내려간다.
    requestAnimationFrame(() => {
      const row = rowRefs.current[slug];
      if (!row) return;
      const top = row.getBoundingClientRect().top + window.scrollY - 150;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  };

  const active = collections.find((c) => c.slug === openSlug);

  return (
    <div className={`${grotesk.className} bg-white text-black min-h-screen pt-32 md:pt-40 pb-32`}>
      <h1 className="sr-only">CAGE3000 Lookbook</h1>
      <ul className="px-6 md:px-12 space-y-6 md:space-y-8">
        {collections.map((c, idx) => {
          const landscape = c.size.width > c.size.height;
          const isOpen = openSlug === c.slug;
          const inner = (
            <>
              <span className={`${label} left-0 underline-offset-2 ${isOpen ? 'underline' : c.images ? 'group-hover:underline' : ''}`}>{c.title}</span>
              <div className={`group/cover relative ${landscape ? 'w-[56vw] md:w-[40vw] md:max-w-[640px]' : 'w-[48vw] md:w-[26vw] md:max-w-[420px]'}`}>
                <Image
                  src={c.cover}
                  alt={c.upcoming ? `${c.title} — ${c.date} 공개 예정` : `${c.title} lookbook`}
                  width={c.size.width}
                  height={c.size.height}
                  sizes={landscape ? '(min-width: 768px) 40vw, 56vw' : '(min-width: 768px) 26vw, 48vw'}
                  priority={idx === 0}
                  style={c.upcoming ? fogStyle : undefined}
                  // 이미 흐리게 만든 파일이라 다시 압축하면 매끈한 번짐에 네모난 얼룩이 생긴다 — 그대로 보낸다.
                  unoptimized={c.upcoming}
                  className="block w-full h-auto"
                />
                {/* 공개 전 티저: 올리면(모바일은 누르는 동안) 덜 흐린 버전이 천천히 비쳐 올라오고, 놓으면 돌아간다. */}
                {c.coverHover && (
                  <Image
                    src={c.coverHover}
                    alt=""
                    aria-hidden
                    width={c.size.width}
                    height={c.size.height}
                    style={fogStyle}
                    unoptimized
                    className="absolute inset-0 block w-full h-auto opacity-0 transition-opacity duration-700 ease-out group-hover/cover:opacity-100 group-active/cover:opacity-100"
                  />
                )}
              </div>
              <span className={`${label} right-0`}>{c.date}</span>
            </>
          );
          return (
            <li key={c.slug} ref={(node) => { rowRefs.current[c.slug] = node; }}>
              {c.images ? (
                <button
                  type="button"
                  onClick={() => toggle(c.slug)}
                  aria-expanded={isOpen}
                  className="group relative flex justify-center w-full"
                >
                  {inner}
                </button>
              ) : (
                <div className="relative flex justify-center">{inner}</div>
              )}
              <AnimatePresence initial={false}>
                {isOpen && <CollectionGrid key={c.slug} collection={c} onOpen={setLightbox} />}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      {active && (
        <LookbookLightbox images={active.images} index={lightbox} onIndexChange={setLightbox} title={active.title} />
      )}
    </div>
  );
}
