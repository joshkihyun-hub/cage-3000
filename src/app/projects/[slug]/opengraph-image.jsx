import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from '@/lib/og-image';
import { PROJECT1_ITEMS } from '@/shared/constants/project1-images';

export const alt = 'CAGE3000 project';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return PROJECT1_ITEMS.map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const project = PROJECT1_ITEMS.find((item) => item.slug === slug);
  if (!project) return new Response('Not Found', { status: 404 });

  return renderOgImage({ image: project.image, focusY: 0.4 });
}
