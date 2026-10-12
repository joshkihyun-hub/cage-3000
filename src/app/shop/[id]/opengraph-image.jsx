import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';
import { items } from '@/shared/constants/shop-items';

export const alt = 'CAGE3000';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// QUARTERS 표지는 머리(모자) 꼭대기가 사진 위에서 13%(모자, 3:4)·10%(상의, 2:3)쯤에 있어
// 기본값(0.3, GREEN 모자 사진 기준)으로 자르면 모자 윗부분이나 얼굴 위가 잘린다 —
// 꼭대기 위로 공유 이미지 높이의 12%쯤 여백이 남는 위치. 하의 표지는 허리부터라 기본값 그대로.
const QUARTERS_FOCUS = { hat: 0.14, upper: 0.09 };

// 상품마다 공유 이미지를 빌드 때 미리 만든다.
export function generateStaticParams() {
  return items.map((item) => ({ id: String(item.id) }));
}

export default async function Image({ params }) {
  const { id } = await params;
  const item = items.find((i) => String(i.id) === String(id));
  if (!item) return new Response('Not Found', { status: 404 });

  return renderOgImage({ image: item.imageUrl, focusY: item.ogFocusY ?? QUARTERS_FOCUS[item.collection === 'quarters' && item.category] });
}
