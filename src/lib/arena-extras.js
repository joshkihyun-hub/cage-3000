import { items } from '@/shared/constants/shop-items';
import { PROJECT1_ITEMS } from '@/shared/constants/project1-images';
import { LOOKBOOK_COLLECTIONS } from '@/shared/constants/lookbook';
import { SITE_URL } from '@/lib/seo';
import { imageUrl } from '@/lib/feed';

// Are.na 채널에만 더 올리는 사진 — 룩북, 가구 제작 과정, 프로젝트의 나머지 컷.
// (RSS·핀터레스트에는 피스·프로젝트 표지 한 장씩만 — feed.js) 상품 상세 각도 컷은 넣지 않는다.
// key는 채널에서 이미 올린 사진을 알아보는 이름 — 사진 주소가 바뀌어도 같은 컷이면 같게.
// 채널 위에서부터 보일 순서대로: QUARTERS 룩북 → GREEN 룩북 → 제작 과정 → 프로젝트.
const pad = (n) => String(n).padStart(2, '0');

export function arenaExtras() {
  const lookbook = LOOKBOOK_COLLECTIONS.filter((c) => c.images?.length).flatMap((c) =>
    c.images.map((img, i) => ({
      key: `lookbook:${c.slug}:${i + 1}`,
      title: `${c.title} — Lookbook ${pad(i + 1)}`,
      link: `${SITE_URL}/collections`,
      summary: `CAGE3000 ${c.title} lookbook, ${c.date}.`,
      image: `${SITE_URL}${img.src}`,
    }))
  );

  const process = items.flatMap((item) =>
    (item.process ?? []).flatMap((group) => group.images).map((src, i) => ({
      key: `process:${src}`,
      title: `CAGE3000 ${item.name} — Process ${pad(i + 1)}`,
      link: `${SITE_URL}/shop/${item.id}`,
      summary: `CAGE3000 ${item.name} — ${item.collection.toUpperCase()}. Process.`,
      image: imageUrl(src),
    }))
  );

  const projects = PROJECT1_ITEMS.flatMap((project) =>
    (project.subImages ?? []).filter((src) => src !== project.image).map((src) => ({
      key: `project:${src}`,
      title: `${project.title} — CAGE3000`,
      link: `${SITE_URL}/projects/${project.slug}`,
      summary: project.description_ko,
      image: imageUrl(src),
    }))
  );

  return [...lookbook, ...process, ...projects];
}
