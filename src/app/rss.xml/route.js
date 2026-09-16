import { items } from '@/shared/constants/shop-items';
import { PROJECT1_ITEMS } from '@/shared/constants/project1-images';
import { SITE_NAME, SITE_URL } from '@/lib/seo';

// RSS 피드 (/rss.xml) — 네이버 서치어드바이저 "RSS 제출"용. 상품·프로젝트가 추가되면
// 자동으로 반영되어 네이버가 새 페이지를 더 빨리 수집한다.
export const dynamic = 'force-static';

const XML_ESCAPES = { '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' };
const escapeXml = (value) => String(value ?? '').replace(/[<>&'"]/g, (c) => XML_ESCAPES[c]);

function renderItem({ title, link, guid, description }) {
  return [
    '<item>',
    `<title>${escapeXml(title)}</title>`,
    `<link>${escapeXml(link)}</link>`,
    `<guid isPermaLink="false">${escapeXml(guid)}</guid>`,
    `<description>${escapeXml(description)}</description>`,
    '</item>',
  ].join('');
}

export function GET() {
  const entries = [
    ...items.map((item) => ({
      title: `CAGE3000 ${item.name}`,
      link: `${SITE_URL}/shop/${item.id}`,
      guid: `${SITE_URL}/shop/${item.id}`,
      description: item.description_ko || item.description,
    })),
    ...PROJECT1_ITEMS.map((project) => ({
      title: `${project.title} — CAGE3000`,
      link: `${SITE_URL}/projects/${project.slug}`,
      guid: `${SITE_URL}/projects/${project.slug}`,
      description: project.description_ko,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${SITE_NAME}</title>
<link>${SITE_URL}</link>
<description>CAGE3000 — 서울 기반 디자이너 패션 브랜드. 의상과 헤드웨어를 주문 제작합니다.</description>
<language>ko</language>
${entries.map(renderItem).join('\n')}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
