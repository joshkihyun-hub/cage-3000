import { NextResponse } from 'next/server';
import { feedEntries, imageUrl, INSTAGRAM } from '@/lib/feed';
import { arenaExtras } from '@/lib/arena-extras';

// Are.na 채널 동기화 — 사이트의 피스·프로젝트 표지와 룩북·제작 과정·프로젝트 컷(arena-extras.js) 중
// 채널에 아직 없는 것만 사진 블록으로 올린다.
// Vercel Cron이 하루 한 번 부른다(vercel.json). 이미 올린 것은 metadata의 key(표지는 사이트 주소)로 알아보고
// 건너뛰므로 몇 번을 불러도 중복되지 않는다. 블록 설명의 링크는 Are.na에서 눌러지는 마크다운 링크다.
//   채널: https://www.are.na/kim-kihyun/cage3000
//   환경변수: ARENA_TOKEN(Are.na 개인 접근 토큰), CRON_SECRET(Vercel Cron이 Authorization 헤더로 보냄)
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const API = 'https://api.are.na/v3';
const CHANNEL = 'cage3000';
const LINK_KEY = 'cage3000_link';
const KEY = 'cage3000_key';
const MAX_PER_RUN = 25;
const TIME_BUDGET_MS = 45_000;

async function arena(path, token, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`Are.na ${init.method ?? 'GET'} ${path} → ${res.status} ${JSON.stringify(body).slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

// 채널에 이미 있는 블록의 사이트 주소·원본 사진 주소. 목록을 다 못 읽으면 예외 — 중복으로 올리지 않게.
async function existingKeys(token) {
  const keys = new Set();
  for (let page = 1; page; ) {
    const { data, meta } = await arena(`/channels/${CHANNEL}/contents?per=100&page=${page}`, token);
    for (const block of data ?? []) {
      // key가 있으면 그것만(룩북·과정 컷은 같은 상품 주소를 출처로 공유한다), 없으면 예전 표지 블록 — 사이트 주소
      if (block.metadata?.[KEY]) { keys.add(block.metadata[KEY]); continue; }
      if (block.metadata?.[LINK_KEY]) keys.add(block.metadata[LINK_KEY]);
      if (block.source?.url) keys.add(block.source.url);
    }
    page = meta?.next_page ?? null;
  }
  return keys;
}

const paths = (link) =>
  `[${link.replace(/^https:\/\//, '')}](${link}) · Instagram ${INSTAGRAM.map((h) => `[@${h}](https://instagram.com/${h})`).join(' ')}`;

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const token = process.env.ARENA_TOKEN;
  if (!token) return NextResponse.json({ error: 'ARENA_TOKEN is not set' }, { status: 500 });

  try {
    const [channel, have] = await Promise.all([arena(`/channels/${CHANNEL}`, token), existingKeys(token)]);

    // 채널은 새로 올린 블록이 맨 위에 쌓인다 — 보여 줄 순서(최신 피스 → 오래된 피스 → 프로젝트 → 룩북 →
    // 제작 과정 → 프로젝트 컷)의 거꾸로 올려야 가장 최근 번호가 맨 위에 선다. 표지의 key는 사이트 주소.
    const entries = feedEntries().filter((e) => e.imageSrc);
    const pieces = entries.filter((e) => e.number).sort((a, b) => b.number - a.number);
    const projects = entries.filter((e) => !e.number);
    const covers = [...pieces, ...projects].map((e) => ({ key: e.link, title: e.title, link: e.link, summary: e.summary, image: imageUrl(e.imageSrc) }));
    const missing = [...covers, ...arenaExtras()]
      .reverse()
      .filter((e) => !have.has(e.key) && !have.has(e.image));

    if (missing.length === 0) return NextResponse.json({ added: 0 });

    // 한 장씩 올린다 — 여러 장을 한 번에 올리는 batch는 Are.na 유료(Premium) 전용이다.
    // 무료 계정의 쓰기 한도와 함수 실행 시간(60초) 안에서 멈추고, 남은 것은 다음 실행이 이어 올린다.
    const started = Date.now();
    let added = 0;
    for (const e of missing) {
      if (added >= MAX_PER_RUN || Date.now() - started > TIME_BUDGET_MS) break;
      try {
        await arena('/blocks', token, {
          method: 'POST',
          body: JSON.stringify({
            value: e.image,
            title: e.title,
            description: `${e.summary}\n\n${paths(e.link)}`,
            alt_text: e.title,
            original_source_url: e.link,
            original_source_title: e.title,
            metadata: { [LINK_KEY]: e.link, [KEY]: e.key },
            channel_ids: [channel.id],
          }),
        });
        added += 1;
      } catch (err) {
        if (err.status === 429) break; // 한도에 닿으면 오늘은 여기까지
        if (err.status === 401 || err.status === 403) throw err; // 토큰 문제 — 나머지도 다 실패한다
        console.error('[cron/arena] skipped', e.link, err.message); // 그 한 장만 건너뛰고 다음 실행에 다시 시도
      }
    }

    return NextResponse.json({ added, remaining: missing.length - added });
  } catch (err) {
    console.error('[cron/arena]', err.message);
    return NextResponse.json({ error: 'Are.na sync failed' }, { status: 502 });
  }
}
