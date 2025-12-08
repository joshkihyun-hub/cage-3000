import { ImageCard } from './image-card';
import { PROJECT1_ITEMS } from '../../shared/constants/project1-images';

export const Gallery = () => {
  return (
    // 갤러리 아이템 간격을 가로(gap-x), 세로(gap-y)로 다르게 설정
    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-x-8 md:gap-y-16 max-w-screen-2xl mx-auto">
      {PROJECT1_ITEMS.map((item) => (
        <ImageCard key={item.id} item={item} />
      ))}
    </div>
  );
}