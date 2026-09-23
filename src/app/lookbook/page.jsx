import { getPublicImageSize } from '@/lib/image-size';
import { LOOKBOOK_COLLECTIONS } from '@/shared/constants/lookbook';
import LookbookIndex from './lookbook-index';

// 대표 이미지의 원본 크기를 빌드 때 읽어 넘긴다 — 원본 비율 그대로 놓기 위해.
export default async function LookbookPage() {
  const collections = await Promise.all(
    LOOKBOOK_COLLECTIONS.map(async (c) => ({ ...c, size: await getPublicImageSize(c.cover) }))
  );

  return <LookbookIndex collections={collections} />;
}
