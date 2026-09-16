import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';
import { items } from '@/shared/constants/shop-items';

export const alt = 'CAGE3000';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

// 상품마다 공유 이미지를 빌드 때 미리 만든다.
export function generateStaticParams() {
  return items.map((item) => ({ id: String(item.id) }));
}

export default async function Image({ params }) {
  const { id } = await params;
  const item = items.find((i) => String(i.id) === String(id));
  if (!item) return new Response('Not Found', { status: 404 });

  return renderOgImage({ image: item.imageUrl });
}
