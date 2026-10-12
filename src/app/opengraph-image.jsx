import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

const HOME_SHARE_IMAGE = '/asset/details/shop/quarters/f01/f01v2_01.jpg';

export const alt = 'CAGE3000 — Designer Fashion from Seoul';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  // QUARTERS 공개(2026-10-12)부터 10(침대)의 표지 사진 — Shop 첫 카드와 같은 장면.
  // 3:2 사진이라 위아래가 잘리는데, 침대가 아래쪽에 있어 맨 아래를 남겨야(focusY 1) 가운데 가깝게 온다.
  return renderOgImage({ image: HOME_SHARE_IMAGE, focusY: 1 });
}
