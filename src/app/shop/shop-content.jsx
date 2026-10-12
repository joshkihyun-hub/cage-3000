'use client';

import Link from 'next/link';
import { items, SHOP_CATEGORIES } from '@/shared/constants/shop-items';
import { ShopItemCard } from '@/components/shop-item-card';
import { grotesk } from '@/shared/fonts';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

// 분류 줄·구역 제목이 함께 쓰는 글자 — 룩북 목록의 이름·날짜와 같은 크기.
const line = `${grotesk.className} text-[11px] md:text-[13px] font-medium tracking-[0.01em] tabular-nums`;

// /shop 주소 — 분류(?category=)와 컬렉션(?collection=)을 함께 들고 다닌다. 기본값은 빼서 짧게.
function shopHref({ category, collection }) {
  const q = new URLSearchParams();
  if (category) q.set('category', category);
  if (collection) q.set('collection', collection);
  const s = q.toString();
  return s ? `/shop?${s}` : '/shop';
}

// 맨 위 분류 — 고른 것만 검게(룩북에서 펼친 컬렉션처럼 밑줄), 나머지는 옅게.
// 주소(?category=)로 남겨 두어 링크로 바로 열 수 있다. 보고 있던 컬렉션은 그대로 둔다.
function CategoryNav({ active, collection }) {
  const links = [{ slug: null, label: 'All' }, ...SHOP_CATEGORIES];
  return (
    <nav aria-label="Shop categories" className={`${line} flex flex-wrap gap-x-5 md:gap-x-7 gap-y-2 mb-12 md:mb-16`}>
      {links.map(({ slug, label }) => {
        const isActive = slug === active;
        return (
          <Link
            key={label}
            href={shopHref({ category: slug, collection })}
            scroll={false}
            aria-current={isActive ? 'page' : undefined}
            className={isActive ? 'underline underline-offset-2' : 'text-zinc-400 hover:text-black transition-colors'}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// 사진 비율(item.aspect)이 같은 상품끼리 이어진 묶음으로 나눈다.
function runsOf(pieces) {
  const runs = [];
  for (const item of pieces) {
    const last = runs[runs.length - 1];
    if (last && last[0].aspect === item.aspect) last.push(item);
    else runs.push([item]);
  }
  return runs;
}

// 컬렉션 줄 — 왼쪽에 컬렉션 이름들(보고 있는 것만 검게, 나머지는 옅게 — 누르면 그 컬렉션으로),
// 오른쪽엔 보고 있는 컬렉션의 날짜. 한 번에 한 컬렉션만 보여 런칭 첫 화면이 이번 시즌 하나로
// 떨어지고, 지난 컬렉션도 같은 줄에서 바로 넘어가 살 수 있다.
// 이름 오른쪽 위의 작은 숫자는 그 컬렉션의 피스 수(고른 분류 기준) — 뒤에 상품이 있다는 걸
// 설명 없이 알려 준다. 공개 전 컬렉션엔 붙이지 않는다.
function countOf(c, category) {
  if (c.upcoming) return null;
  return items.filter((item) => item.collection === c.slug && (!category || item.category === category)).length;
}

function CollectionBar({ collections, active, category }) {
  return (
    <div className={`${line} flex justify-between items-baseline gap-x-6`}>
      <nav aria-label="Collections" className="flex flex-wrap gap-x-5 md:gap-x-7 gap-y-2">
        {collections.map((c, i) => {
          const isActive = c.slug === active.slug;
          const count = countOf(c, category);
          return (
            <Link
              key={c.slug}
              // 맨 앞(최신) 컬렉션은 기본값이라 주소에 남기지 않는다.
              href={shopHref({ category, collection: i === 0 ? null : c.slug })}
              scroll={false}
              aria-current={isActive ? 'page' : undefined}
              className={isActive ? undefined : 'text-zinc-400 hover:text-black transition-colors'}
            >
              {isActive ? <h2 className="inline">{c.title}</h2> : c.title}
              {count !== null && (
                <sup className="ml-[3px] text-[8px] md:text-[9px] font-normal text-zinc-400 tabular-nums align-super">
                  {count}
                </sup>
              )}
            </Link>
          );
        })}
      </nav>
      <span className={`shrink-0 ${active.upcoming ? 'text-zinc-400' : ''}`}>
        {active.upcoming ? `${active.date} Upcoming` : active.date}
      </span>
    </div>
  );
}

// 상품 이름이 "GREEN 01"이라 컬렉션 안에선 번호만 쓴다. `appear`면 카드가 읽는 순서대로
// 옅게 나타나며 6px 떠오른다(컬렉션을 바꿀 때 — 룩북 격자와 같은 결).
function Pieces({ c, appear }) {
  let n = 0;
  return runsOf(c.pieces).map((run, r) => (
    // 가로로 긴 작품(가구)과 세로 카드가 한 줄에 섞이면 높이가 어긋난다 — 같은 비율끼리
    // 이어진 묶음마다 격자를 따로 두고, 가로 묶음은 모바일 1열·데스크톱 2열로 넓게.
    // 묶음 사이 간격은 격자 줄 간격과 같게 — 한 격자처럼 이어 보이도록.
    <div
      key={run[0].id}
      className={`${r === 0 ? 'mt-6 md:mt-8' : 'mt-8 md:mt-16'} grid gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-16 ${
        run[0].aspect ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
      }`}
    >
      {run.map((item) => {
        const i = n++;
        return (
          <div
            key={item.id}
            className="flex flex-col"
            style={appear ? { animation: `rise-in-short 0.6s ease-out ${i * 0.03}s both` } : undefined}
          >
            {/* 첫 줄(앞의 3장)만 미리 받는다. */}
            <ShopItemCard item={item} label={item.name.replace(`${c.title} `, '')} priority={i < 3} />
          </div>
        );
      })}
    </div>
  ));
}

export function ShopView({ collections, category = null, collection = null }) {
  const active = collections.find((c) => c.slug === collection) || collections[0];
  const shown = {
    ...active,
    pieces: active.upcoming
      ? []
      : items.filter((item) => item.collection === active.slug && (!category || item.category === category)),
  };
  // 처음 열 때는 그냥 보이고, 컬렉션을 바꿀 때만 카드가 떠오른다(렌더 중 상태 조정 — 이전 값과 비교).
  const [prev, setPrev] = useState(active.slug);
  const [appear, setAppear] = useState(false);
  if (prev !== active.slug) {
    setPrev(active.slug);
    setAppear(true);
  }

  return (
    <>
      <CategoryNav active={category} collection={collection} />
      <section aria-label={shown.title}>
        <CollectionBar collections={collections} active={active} category={category} />
        {!shown.upcoming && shown.pieces.length === 0 && (
          <p className={`${line} mt-6 md:mt-8 text-zinc-400`}>Nothing here yet</p>
        )}
        <Pieces key={active.slug} c={shown} appear={appear} />
      </section>
    </>
  );
}

export default function ShopContent({ collections }) {
  const searchParams = useSearchParams();
  // 예전 분류 이름(objects → hat)으로 저장된 링크도 같은 곳으로.
  const raw = searchParams.get('category');
  const requested = raw === 'objects' ? 'hat' : raw;
  const category = SHOP_CATEGORIES.some((c) => c.slug === requested) ? requested : null;
  const wanted = searchParams.get('collection');
  const collection = collections.some((c) => c.slug === wanted) ? wanted : null;

  return <ShopView collections={collections} category={category} collection={collection} />;
}
