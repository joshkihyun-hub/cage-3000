import Link from 'next/link';
import Image from 'next/image';
import { PROJECT1_ITEMS } from '../../shared/constants/project1-images';

// "FASHION / 2025" 형태의 subtitle에서 연도만 뽑아낸다.
function extractYear(subtitle) {
    const m = String(subtitle || '').match(/\d{4}/);
    return m ? m[0] : '';
}

export default function ProjectsPage() {
    return (
        <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-32">
            <div className="max-w-screen-2xl mx-auto px-6 md:px-12">
                <ul className="space-y-3 md:space-y-5">
                    {PROJECT1_ITEMS.map((item) => {
                        const year = extractYear(item.subtitle);
                        return (
                            <li key={item.id}>
                                <Link
                                    href={`/details/${item.id}`}
                                    className="group inline-flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 hover:opacity-60 transition-opacity"
                                >
                                    <span className="font-sans text-3xl md:text-5xl lg:text-6xl leading-none tracking-tight text-black">
                                        {item.title}
                                    </span>
                                    <span className="relative inline-block h-10 md:h-14 lg:h-16 aspect-[4/3] overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            sizes="200px"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    </span>
                                    {year && (
                                        <span className="font-sans text-xl md:text-3xl lg:text-4xl text-zinc-400 leading-none">
                                            {year}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
