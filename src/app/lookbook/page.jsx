import Image from 'next/image';
import Link from 'next/link';
import { getPublicImageSize } from '@/lib/image-size';
import { grotesk } from '@/shared/fonts';
import { LOOKBOOK_COLLECTIONS } from '@/shared/constants/lookbook';

const label = 'absolute top-1/2 -translate-y-1/2 text-[11px] md:text-[13px] font-medium tracking-[0.01em] tabular-nums';

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

// 컬렉션 목록 — 가운데에 대표 이미지 한 장(원본 비율), 왼쪽 끝엔 컬렉션 이름, 오른쪽 끝엔 공개 날짜.
// 가로 사진은 조금 넓게, 세로 사진은 조금 좁게 놓아 줄마다 크기가 달라진다.
export default async function LookbookPage() {
  const collections = await Promise.all(
    LOOKBOOK_COLLECTIONS.map(async (c) => ({ ...c, size: await getPublicImageSize(c.cover) }))
  );

  return (
    <div className={`${grotesk.className} bg-white text-black min-h-screen pt-40 md:pt-48 pb-32`}>
      <h1 className="sr-only">CAGE3000 Lookbook</h1>
      <ul className="px-4 md:px-12 space-y-6 md:space-y-8">
        {collections.map((c, idx) => {
          const landscape = c.size.width > c.size.height;
          const inner = (
            <>
              <span className={`${label} left-0 ${c.upcoming ? '' : 'group-hover:underline underline-offset-2'}`}>{c.title}</span>
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
            <li key={c.slug}>
              {c.upcoming ? (
                <div className="relative flex justify-center">{inner}</div>
              ) : (
                <Link href={`/lookbook/${c.slug}`} className="group relative flex justify-center">
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
