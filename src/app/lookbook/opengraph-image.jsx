import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

export const alt = 'CAGE3000 Lookbook';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ image: '/asset/details/lookbook/9hat/A1.jpg', focusY: 0.55 });
}
