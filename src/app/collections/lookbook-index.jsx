'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { grotesk } from '@/shared/fonts';
import LookbookLightbox from './lightbox';

// 한 줄 = [이름 | 대표 이미지 | 날짜] 세 칸. 양옆 칸은 같은 최소 폭(--side: 가장 긴 이름·날짜만큼)을
// 똑같이 나눠 가져 이미지는 늘 정가운데에 서고, 좁은 폰에선 이미지가 조금 줄어들 뿐 글자에 닿지 않는다.
// 글자 크기를 줄에 걸어 두어 --side의 em이 글자 크기를 따른다.
const row =
  'grid grid-cols-[minmax(var(--side),1fr)_minmax(0,max-content)_minmax(var(--side),1fr)] items-center gap-x-3 md:gap-x-6 w-full text-[11px] md:text-[13px] font-medium tracking-[0.01em] tabular-nums';
// 글자 한 자의 폭(em) — Inter Tight 대문자·숫자 평균보다 약간 넉넉하게.
const CHAR_EM = 0.66;
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

// 사진은 원본 비율 그대로(자르지 않음) — 한 줄의 사진들이 같은 높이로 서고 가로 폭은 각자 비율대로
// 늘어나 줄을 채운다(기준의 1.15배까지만, 남으면 가운데로 모은다). 읽는 순서도 그대로.
// 기준 높이(--h)는 모든 컬렉션이 같다(GREEN과 같은 크기).
function CollectionGrid({ collection, onOpen }) {
  return (
    <motion.div
      exit={{ height: 0, opacity: 0, transition: { duration: 0.4, ease: SOFT } }}
      className="overflow-hidden"
    >
      <div
        className="flex flex-wrap justify-center gap-x-2 gap-y-4 md:gap-x-3 md:gap-y-5 pt-10 md:pt-14 pb-16 md:pb-24 [--h:120px] md:[--h:220px]"
      >
        {collection.images.map((img, i) => {
          const ratio = img.width / img.height;
          // feature 사진은 혼자 한 줄을 차지하고, 높이를 크게 잡아 격자에서 가장 크게 보인다(가운데).
          const featured = collection.feature === i;
          return (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: SOFT, delay: 0.1 + i * 0.03 }}
              style={
                featured
                  ? { flexBasis: '100%' }
                  // 줄을 채우려고 늘어나되 기준의 1.15배까지만 — 가로 사진이 많은 컬렉션도 GREEN과 같은 크기로.
                  : { flexGrow: ratio, flexBasis: `calc(var(--h) * ${ratio})`, maxWidth: `calc(var(--h) * ${ratio * 1.15})` }
              }
              className={featured ? 'flex flex-col items-center py-4 md:py-8' : undefined}
            >
              <button
                type="button"
                onClick={() => onOpen(i)}
                aria-label={`${collection.title} ${pad(i + 1)} 크게 보기`}
                className={`group/thumb relative block overflow-hidden bg-zinc-100 cursor-zoom-in ${
                  featured ? 'h-[calc(var(--h)*2)] max-w-full' : 'w-full'
                }`}
                style={{ aspectRatio: `${img.width} / ${img.height}` }}
              >
                <Image
                  src={img}
                  alt={`${collection.title} lookbook ${i + 1}`}
                  fill
                  placeholder="blur"
                  // 칸 폭은 기준 높이(--h: 모바일 120px·데스크톱 220px)로 정해진다 — 화면 폭 비율(vw)로
                  // 적으면 넓은 화면에선 너무 큰 파일을, 가로 사진은 모바일에서 덜 선명한 파일을 받는다.
                  sizes={
                    featured
                      ? `(min-width: 768px) ${Math.ceil(440 * ratio)}px, ${Math.ceil(240 * ratio)}px`
                      : `(min-width: 768px) ${Math.ceil(220 * ratio * 1.15)}px, ${Math.ceil(120 * ratio * 1.15)}px`
                  }
                  className="object-cover transition-transform duration-700 ease-out group-hover/thumb:scale-[1.03]"
                />
              </button>
              <span className={`block mt-1.5 text-[10px] md:text-[11px] font-medium tabular-nums text-zinc-400 ${featured ? 'self-stretch text-center' : ''}`}>
                {pad(i + 1)}
              </span>
            </motion.div>
          );
        })}
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
  // 모든 줄이 같은 폭을 비워 두어야 이미지 크기·위치가 줄마다 같다.
  const longest = Math.max(...collections.flatMap((c) => [c.title.length, c.date.length]));

  return (
    <div className={`${grotesk.className} bg-white text-black min-h-screen pt-32 md:pt-40 pb-32`}>
      <h1 className="sr-only">CAGE3000 Collections</h1>
      <ul className="px-6 md:px-12 space-y-6 md:space-y-8" style={{ '--side': `${longest * CHAR_EM}em` }}>
        {collections.map((c, idx) => {
          const landscape = c.size.width > c.size.height;
          const isOpen = openSlug === c.slug;
          const inner = (
            <>
              <span className={`justify-self-start text-left underline-offset-2 ${isOpen ? 'underline' : c.images ? 'group-hover:underline' : ''}`}>{c.title}</span>
              <div className={`group/cover relative max-w-full ${landscape ? 'w-[56vw] md:w-[40vw] md:max-w-[min(640px,100%)]' : 'w-[48vw] md:w-[26vw] md:max-w-[min(420px,100%)]'}`}>
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
              <span className="justify-self-end text-right">{c.date}</span>
            </>
          );
          return (
            <li key={c.slug} ref={(node) => { rowRefs.current[c.slug] = node; }}>
              {c.images ? (
                <button
                  type="button"
                  onClick={() => toggle(c.slug)}
                  aria-expanded={isOpen}
                  className={`group ${row}`}
                >
                  {inner}
                </button>
              ) : (
                <div className={row}>{inner}</div>
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
