import Link from 'next/link';
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
                <ul className="space-y-2 md:space-y-4">
                    {PROJECT1_ITEMS.map((item) => {
                        const year = extractYear(item.subtitle);
                        return (
                            <li key={item.id}>
                                <Link
                                    href={`/details/${item.id}`}
                                    className="group inline-flex flex-wrap items-center gap-x-3 md:gap-x-5 gap-y-2 blur-[5px] hover:blur-0 transition-[filter] duration-500 ease-out"
                                >
                                    <span className="font-sans text-2xl md:text-3xl lg:text-4xl leading-none tracking-tight text-black">
                                        {item.title}
                                    </span>
                                    {/*
                                        Inline thumbnail at a fixed height, width auto so the
                                        original aspect ratio survives intact (square, portrait,
                                        and landscape source images all stay un-cropped).
                                        Raw <img> keeps that 'h-N w-auto' behaviour clean —
                                        Next.js Image needs explicit dimensions per source to do
                                        the same and would offer near-zero optimization gain at
                                        these thumbnail sizes.
                                    */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-8 md:h-10 lg:h-12 w-auto object-contain transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {year && (
                                        <span className="font-sans text-base md:text-xl lg:text-2xl text-zinc-400 leading-none">
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
