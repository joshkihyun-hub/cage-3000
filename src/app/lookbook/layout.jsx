import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Lookbook',
  description:
    'CAGE3000 룩북 — 시즌 컬렉션의 무드와 실루엣을 담은 비주얼. Sculpted headwear from Seoul.',
  path: '/lookbook',
  ogDescription: 'CAGE3000 시즌 컬렉션 룩북.',
});

export default function LookbookLayout({ children }) {
  return children;
}
