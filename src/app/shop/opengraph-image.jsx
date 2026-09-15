import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

export const alt = 'CAGE3000 Shop';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ image: '/asset/details/shop/9hat/hat6/shop_hat6_lookbook1.jpg', focusY: 0.5 });
}
