import Link from 'next/link';

export const ImageCard = ({ item }) => {
  return (
    <Link href={`/details/${item.id}`} className="group block text-left">
      <div className="relative overflow-hidden aspect-[3/4] bg-zinc-50 mb-8">
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
        {/* Overlay Text (Optional, mimicking the shop style) */}
        <div className="absolute inset-0 flex items-center justify-center text-white font-light text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10">
          VIEW PROJECT
        </div>
      </div>

      {/* Title removed from list view as per request */}
      <div className="hidden">
        <h3 className="text-lg md:text-2xl font-serif font-light uppercase tracking-wide text-black leading-tight">
          {item.title}
        </h3>
      </div>
    </Link>
  );
};