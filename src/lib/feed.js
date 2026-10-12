import { items } from '@/shared/constants/shop-items';
import { PROJECT1_ITEMS } from '@/shared/constants/project1-images';
import { SITE_URL } from '@/lib/seo';

// 사이트 밖으로 내보내는 작업 목록 — RSS(네이버·핀터레스트)와 Are.na 채널이 같이 쓴다.
// 피스·프로젝트가 추가되면 여기서 저절로 늘어나 양쪽에 함께 퍼진다.
// 사진은 첫 장 하나(public 폴더 기준 경로). summary는 사실만 적고, 경로 안내는 각 채널이 붙인다.
export const INSTAGRAM = ['cage3k', 'choppycocky'];

export function feedEntries() {
  return [
    ...items.map((item) => ({
      number: Number(item.name) || 0,
      title: `CAGE3000 ${item.name}`,
      link: `${SITE_URL}/shop/${item.id}`,
      summary: `CAGE3000 ${item.name} — ${item.collection.toUpperCase()}. ${item.price ?? ''}`.trim(),
      imageSrc: item.images?.[0] ?? item.imageUrl,
    })),
    ...PROJECT1_ITEMS.map((project) => ({
      title: `${project.title} — CAGE3000`,
      link: `${SITE_URL}/projects/${project.slug}`,
      summary: project.description_ko,
      imageSrc: project.image,
    })),
  ];
}

export const imageUrl = (src) => `${SITE_URL}${encodeURI(src)}`;
