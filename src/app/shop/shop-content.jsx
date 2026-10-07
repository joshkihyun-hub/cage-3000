'use client';

import Link from 'next/link';
import { items, SHOP_CATEGORIES } from '@/shared/constants/shop-items';
import { ShopItemCard } from '@/components/shop-item-card';
import { grotesk } from '@/shared/fonts';
import { useSearchParams } from 'next/navigation';

// 분류 줄·구역 제목이 함께 쓰는 글자 — 룩북 목록의 이름·날짜와 같은 크기.
const line = `${grotesk.className} text-[11px] md:text-[13px] font-medium tracking-[0.01em] tabular-nums`;

// 맨 위 분류 — 고른 것만 검게(룩북에서 펼친 컬렉션처럼 밑줄), 나머지는 옅게.
// 주소(?category=)로 남겨 두어 링크로 바로 열 수 있다.
function CategoryNav({ active }) {
  const links = [{ slug: null, label: 'All' }, ...SHOP_CATEGORIES];
  return (
    <nav aria-label="Shop categories" className={`${line} flex flex-wrap gap-x-5 md:gap-x-7 gap-y-2 mb-12 md:mb-16`}>
      {links.map(({ slug, label }) => {
        const isActive = slug === active;
        return (
          <Link
            key={label}
            href={slug ? `/shop?category=${slug}` : '/shop'}
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

// 컬렉션별 구역 — 이름은 왼쪽, 날짜는 오른쪽. 공개 전 컬렉션은 상품 없이 이 한 줄만 보인다.
// 분류를 고르면 그 분류의 상품이 없는 구역은 빠진다. 상품 이름이 "GREEN 01"이라 구역 안에선 번호만 쓴다.
export function ShopView({ collections, category = null }) {
  const sections = collections
    .map((c) => ({
      ...c,
      pieces: c.upcoming
        ? []
        : items.filter((item) => item.collection === c.slug && (!category || item.category === category)),
    }))
    .filter((c) => c.upcoming || c.pieces.length > 0);
  // 페이지 전체에서 몇 번째 카드인지 — 첫 줄(앞의 3개)만 미리 받는다.
  const startOf = (idx) => sections.slice(0, idx).reduce((n, s) => n + s.pieces.length, 0);

  return (
    <>
      <CategoryNav active={category} />
      {sections.length === 0 && <p className={`${line} text-zinc-400`}>Nothing here yet</p>}
      <div className="flex flex-col gap-y-16 md:gap-y-28">
        {sections.map((c, idx) => (
          <section key={c.slug} aria-label={c.title}>
            <div className={`${line} flex justify-between items-baseline`}>
              <h2>{c.title}</h2>
              <span className={c.upcoming ? 'text-zinc-400' : undefined}>
                {c.upcoming ? `${c.date} Upcoming` : c.date}
              </span>
            </div>
            {c.pieces.length > 0 && (
              <div className="mt-6 md:mt-8 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-8 md:gap-y-16">
                {c.pieces.map((item, i) => (
                  <ShopItemCard
                    key={item.id}
                    item={item}
                    label={item.name.replace(`${c.title} `, '')}
                    priority={startOf(idx) + i < 3}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

export default function ShopContent({ collections }) {
  const searchParams = useSearchParams();
  const requested = searchParams.get('category');
  const category = SHOP_CATEGORIES.some((c) => c.slug === requested) ? requested : null;

  return <ShopView collections={collections} category={category} />;
}
