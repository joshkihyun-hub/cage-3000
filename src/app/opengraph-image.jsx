import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

export const alt = 'CAGE3000 — Designer Fashion from Seoul';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  // 홈에서 먼저 공개한 영상의 한 장면 — 인물이 웅크려 스툴을 조립하는 순간.
  // 이미 1200×630으로 잘라둔 파일이라 focusY는 결과에 영향을 주지 않는다.
  return renderOgImage({ image: '/asset/og/hero-still.jpg', focusY: 0.5 });
}
