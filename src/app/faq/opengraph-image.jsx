import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';

export const alt = 'CAGE3000 FAQ';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgImage({ image: '/asset/details/shop/9hat/hat3/shop_hat3_main1.jpeg' });
}
