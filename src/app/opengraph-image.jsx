import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

export const alt = 'CAGE3000 — Sculpted Headwear from Seoul';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ image: '/asset/details/lookbook/9hat/A3.jpeg', focusY: 0.5 });
}
