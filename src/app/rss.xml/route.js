import { statSync } from 'node:fs';
import path from 'node:path';
import { SITE_NAME, SITE_URL } from '@/lib/seo';
import { feedEntries, imageUrl, INSTAGRAM } from '@/lib/feed';

// RSS 피드 (/rss.xml) — 네이버 서치어드바이저 "RSS 제출"과 핀터레스트 자동 게시용. 상품·프로젝트가
// 추가되면 자동으로 반영되어 네이버는 새 페이지를 더 빨리 수집하고, 핀터레스트는 새 핀을 만든다.
// 핀터레스트는 사진이 없는 항목을 건너뛰므로 항목마다 대표 사진(첫 장)을 붙인다.
export const dynamic = 'force-static';

// 핀 설명 끝에 붙는 경로 — 핀터레스트에서 사이트와 인스타그램(브랜드·디자이너)으로 찾아오게.
const PATHS = `cage3000.com · Instagram ${INSTAGRAM.map((h) => `@${h}`).join(' ')}`;

const XML_ESCAPES = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
const escapeXml = (value) => String(value ?? '').replace(/[<>&'"]/g, (c) => XML_ESCAPES[c]);

const IMAGE_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// 사진 주소와 파일 크기(enclosure는 크기를 적어야 한다) — 빌드 때 public 폴더에서 읽는다.
function imageOf(src) {
  if (!src) return null;
  try {
    const { size } = statSync(path.join(process.cwd(), 'public', src));
    return { url: imageUrl(src), type: IMAGE_TYPES[path.extname(src).toLowerCase()] ?? 'image/jpeg', size };
  } catch {
    return null;
  }
}

function renderItem({ title, link, guid, description, image }) {
  return [
    '<item>',
    `<title>${escapeXml(title)}</title>`,
    `<link>${escapeXml(link)}</link>`,
    `<guid isPermaLink="false">${escapeXml(guid)}</guid>`,
    `<description>${escapeXml(description)}</description>`,
    image && `<enclosure url="${escapeXml(image.url)}" length="${image.size}" type="${image.type}"/>`,
    image && `<media:content url="${escapeXml(image.url)}" medium="image" type="${image.type}"/>`,
    '</item>',
  ].filter(Boolean).join('');
}

export function GET() {
  const entries = feedEntries().map((entry) => ({
    title: entry.title,
    link: entry.link,
    guid: entry.link,
    description: `${entry.summary}\n${PATHS}`,
    image: imageOf(entry.imageSrc),
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
<title>${SITE_NAME}</title>
<link>${SITE_URL}</link>
<description>CAGE3000 — 서울 기반 디자이너 패션 브랜드. 의상과 헤드웨어를 주문 제작하며, 커스텀 메이드 제작도 가능합니다.</description>
<language>ko</language>
${entries.map(renderItem).join('\n')}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
