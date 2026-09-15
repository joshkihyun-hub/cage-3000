import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

export const alt = 'CAGE3000 Projects';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ image: '/asset/details/heavy-serenade/heavy-serenade2.jpg', focusY: 0.6 });
}
