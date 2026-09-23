'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROJECT1_ITEMS, PROJECT_CATEGORIES } from '../../shared/constants/project1-images';
import CommissionInquiry from '../../components/commission-inquiry';
import { grotesk } from '../../shared/fonts';

const FILTERS = [
    { key: 'all', label: 'All' },
    ...PROJECT_CATEGORIES.map((c) => ({ key: c.key, label: c.label })),
].map((f) => ({
    ...f,
    count: PROJECT1_ITEMS.filter((item) => f.key === 'all' || item.category === f.key).length,
})).filter((f) => f.count > 0);

// 번호는 필터와 상관없이 전체 목록 순서로 고정 — (02)는 언제나 같은 작업.
const NUMBER = Object.fromEntries(
    PROJECT1_ITEMS.map((item, idx) => [item.id, `(${String(idx + 1).padStart(2, '0')})`])
);

// 시드 고정 난수(mulberry32). 서버·클라이언트가 같은 배치를 그려야 하므로 Math.random은 쓰지 않는다.
function seeded(seed) {
    let s = seed | 0;
    return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// 작업마다 고유한 "성격" — 크기, 칸 안에서 치우친 정도, 점이 붙는 자리.
// 필터가 바뀌어도 그대로라서, 남은 작업은 크기가 변하지 않고 자리만 옮겨 간다.
const TRAITS = Object.fromEntries(
    PROJECT1_ITEMS.map((item) => {
        const r = seeded(item.id * 7919 + 13);
        return [item.id, {
            wDesk: item.featured ? 0.35 : 0.19 + r() * 0.07,
            wMob: item.featured ? 0.66 : 0.36 + r() * 0.08,
            jx: r(),
            jy: r(),
            marker: Math.floor(r() * 4), // 0 위-오른쪽 · 1 아래-왼쪽 · 2 아래-오른쪽 · 3 위-왼쪽
        }];
    })
);

// 보드 배치. 줄마다 칸 수를 번갈아(데스크탑 3·2, 모바일 2·1) 나누고, 각 작업은 자기 칸 안에서
// 가로·세로로 조금씩 흩어진다. 대표 작업은 두 칸을 차지한다.
// 좌표는 모두 보드 폭을 1로 둔 비율 — CSS에서 %와 cqw로 풀어 쓴다.
const LAYOUTS = {
    mob: { caps: [2, 1], width: 'wMob', margin: 0.02, rowGap: 0.26, jitterY: 0.05, top: 0.04, bottom: 0.26 },
    desk: { caps: [3, 2], width: 'wDesk', margin: 0.025, rowGap: 0.075, jitterY: 0.06, top: 0.05, bottom: 0.06 },
};

function computeLayout(items, imageSizes, cfg) {
    const rows = [];
    for (const item of items) {
        const cost = item.featured ? 2 : 1;
        let row = rows[rows.length - 1];
        if (!row || (row.items.length > 0 && row.used + cost > row.cap)) {
            row = { cap: cfg.caps[rows.length % cfg.caps.length], used: 0, items: [] };
            rows.push(row);
        }
        row.items.push({ item, cost });
        row.used += cost;
    }

    const pos = {};
    let y = cfg.top;
    rows.forEach((row, rowIdx) => {
        const unit = 1 / Math.max(row.cap, row.used);
        // 덜 찬 줄은 빈 칸만큼 통째로 옆으로 밀어 가운데 몰림을 피한다.
        const leftover = Math.max(0, row.cap - row.used) * unit;
        let cellStart = seeded(rowIdx * 31 + items.length)() * leftover;
        let bottom = y;
        for (const { item, cost } of row.items) {
            const t = TRAITS[item.id];
            const cellW = cost * unit;
            const w = t[cfg.width];
            const x = cellStart + cfg.margin + t.jx * Math.max(0, cellW - w - 2 * cfg.margin);
            const top = y + t.jy * cfg.jitterY;
            const size = imageSizes[item.image];
            const h = w * (size.height / size.width);
            // 오른쪽 끝에 붙은 작업은 라벨이 화면 밖으로 나가지 않게 왼쪽 자리로.
            const marker = x + w > 0.8 && (t.marker === 0 || t.marker === 2) ? t.marker + 1 : t.marker;
            pos[item.id] = { x, y: top, w, marker };
            bottom = Math.max(bottom, top + h);
            cellStart += cellW;
        }
        y = bottom + cfg.rowGap;
    });
    return { pos, height: y - cfg.rowGap + cfg.bottom };
}

// 점 + 번호(+ 제목). 이미지 바깥 위/아래에 붙는다.
// 모바일은 이미지 폭 안에서 왼쪽 정렬, 데스크탑은 네 자리 중 하나로 비껴 선다.
// 제목은 터치 기기에선 늘 보이고, 마우스가 있으면 hover 때만 떠오른다.
const MARKER_PLACE = [
    'bottom-full pb-2 md:left-[68%]', // 위-오른쪽
    'top-full pt-2 md:left-[-9%]',    // 아래-왼쪽
    'top-full pt-2 md:left-[72%]',    // 아래-오른쪽
    'bottom-full pb-2 md:left-[-7%]', // 위-왼쪽
];

function Marker({ item, place }) {
    return (
        <div className={`absolute left-0 right-0 md:right-auto md:w-max md:max-w-56 ${MARKER_PLACE[place]}`}>
            <div className="flex items-center gap-2 md:gap-2.5">
                <span className="block shrink-0 w-3 h-3 md:w-[18px] md:h-[18px] rounded-full bg-black" />
                <span className="text-[12px] md:text-[15px] tabular-nums text-black">{NUMBER[item.id]}</span>
            </div>
            <p className="mt-1 text-[10px] md:text-[11px] leading-snug uppercase tracking-[0.02em] text-zinc-500 transition-opacity duration-300 [@media(hover:hover)]:opacity-0 group-hover:opacity-100">
                {item.title}
            </p>
        </div>
    );
}

const EASE = [0.4, 0, 0.2, 1];

export default function ProjectsClient({ imageSizes }) {
    const [filter, setFilter] = useState('all');

    const items = PROJECT1_ITEMS.filter((item) => filter === 'all' || item.category === filter);
    const mob = computeLayout(items, imageSizes, LAYOUTS.mob);
    const desk = computeLayout(items, imageSizes, LAYOUTS.desk);

    return (
        <div className={`${grotesk.className} bg-white text-black min-h-screen pt-32 md:pt-40 pb-24 overflow-x-clip`}>
            <div className="px-6 md:px-12">
                <h1 className="sr-only">CAGE3000 Projects</h1>

                <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 text-[10px] md:text-[11px] font-medium tracking-[0.02em] uppercase">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {FILTERS.map((f) => (
                            <button
                                key={f.key}
                                type="button"
                                onClick={() => setFilter(f.key)}
                                className={`uppercase transition-colors ${filter === f.key ? 'text-black' : 'text-zinc-400 hover:text-black'}`}
                            >
                                {f.label} ({f.count})
                            </button>
                        ))}
                    </div>
                    <CommissionInquiry
                        className={grotesk.className}
                        triggerClassName="md:ml-auto uppercase text-zinc-400 hover:text-black transition-colors"
                    >
                        Commission inquiry →
                    </CommissionInquiry>
                </div>

                {/* 보드 — 좌표는 보드 폭 기준(cqw)이라 화면 크기가 달라도 같은 구도를 유지한다.
                    필터를 바꾸면 남은 작업은 새 자리로 미끄러지고(layout), 빠지는 작업은 옅어지며 사라진다. */}
                <div className="@container mt-6 md:mt-4">
                    <div
                        className="relative h-[calc(var(--h)*100cqw)] md:h-[calc(var(--hd)*100cqw)] transition-[height] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ '--h': mob.height, '--hd': desk.height }}
                    >
                        <AnimatePresence mode="popLayout" initial={false}>
                            {items.map((item) => {
                                const m = mob.pos[item.id];
                                const d = desk.pos[item.id];
                                const size = imageSizes[item.image];
                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.94 }}
                                        transition={{ duration: 0.5, ease: EASE, layout: { duration: 0.85, ease: EASE } }}
                                        className="absolute left-[calc(var(--x)*100%)] top-[calc(var(--y)*100cqw)] w-[calc(var(--w)*100%)] md:left-[calc(var(--xd)*100%)] md:top-[calc(var(--yd)*100cqw)] md:w-[calc(var(--wd)*100%)]"
                                        style={{ '--x': m.x, '--y': m.y, '--w': m.w, '--xd': d.x, '--yd': d.y, '--wd': d.w }}
                                    >
                                        <Link href={`/projects/${item.slug}`} className="group relative block">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                width={size.width}
                                                height={size.height}
                                                sizes={item.featured ? '(min-width: 768px) 36vw, 66vw' : '(min-width: 768px) 26vw, 44vw'}
                                                draggable={false}
                                                className="block w-full h-auto select-none"
                                            />
                                            {/* 모바일은 줄 간격이 좁아 위쪽 자리(0·3)도 아래로 붙인다. */}
                                            <div className="md:hidden"><Marker item={item} place={1} /></div>
                                            <div className="hidden md:block"><Marker item={item} place={d.marker} /></div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
