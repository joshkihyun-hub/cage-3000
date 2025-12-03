import Link from 'next/link';
// TODO: 이 컴포넌트를 사용하는 상위 파일(예: gallery.jsx)에서 Roboto Mono 폰트를 import해야 합니다.
// import { Roboto_Mono } from 'next/font/google';
// const robotoMono = Roboto_Mono({ subsets: ['latin'], weight: ['500'] });

export const ImageCard = ({ item }) => {
  return (
    <Link href={`/details/${item.id}`} className="group block text-left">
      <div className="relative overflow-hidden aspect-[3/4] border border-zinc-200">
        {/* 기본 이미지 */}
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover object-top
                     transform scale-100 group-hover:scale-105 opacity-100 group-hover:opacity-0
                     transition-all duration-700 ease-in-out"
        />
        {/* 호버 이미지 */}
        <img
          src={item.image_hover || item.image}
          alt={`${item.title} hover view`}
          className="absolute inset-0 w-full h-full object-cover object-top
                     transform scale-110 group-hover:scale-100 opacity-0 group-hover:opacity-100
                     transition-all duration-700 ease-in-out"
        />
      </div>

      {/* 1. 텍스트 부분을 가로 정렬 레이아웃으로 변경하고 스타일을 다듬습니다. */}
      <div className="mt-3 flex justify-between items-baseline font-mono">
        <h3 className="text-sm font-medium text-zinc-900 truncate pr-4">
          {item.title}
        </h3>
        <p className="text-xs text-zinc-500 uppercase flex-shrink-0">
          {item.subtitle}
        </p>
      </div>
    </Link>
  );
};