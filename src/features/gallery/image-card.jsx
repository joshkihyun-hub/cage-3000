import Link from 'next/link';
import Image from 'next/image';

export const ImageCard = ({ item }) => {
  return (
    <Link href={`/details/${item.id}`} className="group block text-left">
      <div className="relative overflow-hidden aspect-[3/4] bg-zinc-50 mb-8">
        {/* 기본 이미지 */}
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out group-hover:opacity-0 z-10">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-top transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
        </div>

        {/* 호버 이미지 */}
        <div className="absolute inset-0 transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100 z-10">
          <Image
            src={item.image_hover || item.image}
            alt={`${item.title} hover view`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-top transform scale-110 group-hover:scale-100 transition-transform duration-700 ease-in-out"
          />
        </div>

        {/* Overlay Text (Optional, mimicking the shop style) */}
        <div className="absolute inset-0 flex items-center justify-center text-white font-light text-xs tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 z-20">
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