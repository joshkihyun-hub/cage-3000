import { PROJECT1_ITEMS } from '@/shared/constants/project1-images';
import { getPublicImageSize } from '@/lib/image-size';
import ProjectsClient from './projects-client';

// 원본 크기를 빌드 때 읽어 next/image에 넘긴다 — 목록 썸네일과 캐러셀 이미지 전부.
export default async function ProjectsPage() {
  const paths = [
    ...new Set(PROJECT1_ITEMS.flatMap((item) => [item.image, ...(item.subImages ?? [])])),
  ];
  const entries = await Promise.all(
    paths.map(async (src) => [src, await getPublicImageSize(src)])
  );

  return <ProjectsClient imageSizes={Object.fromEntries(entries)} />;
}
