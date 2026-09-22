import Image from 'next/image';

const ABOUT_FACTS = [
    { label: 'Atelier', value: 'Yeonhui-dong, Seoul' },
    { label: '', value: 'Handmade millinery' },
    { label: 'Designer', value: 'Kihyun Kim' },
    {
        label: 'Selected clients',
        value: "NMIXX, PURYNN, Harper's Bazaar, Esquire Korea, PUMA × Manchester City, DAZED",
    },
];

export default function AboutPage() {
    return (
        <div className="bg-white text-zinc-900 min-h-screen font-sans">
            <section className="max-w-screen-md mx-auto px-6 md:px-12 pt-40 md:pt-48 pb-40 md:pb-48 flex flex-col items-center">

                {/* Profile Picture (Vertical Rectangular Archival Print) */}
                <div className="relative w-28 h-36 md:w-32 md:h-40 overflow-hidden border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                    <Image
                        src="/about_profile.png"
                        alt="Kihyun Kim"
                        fill
                        className="object-cover object-[38%_center] grayscale brightness-[0.98] contrast-[1.02] transition-transform duration-700 hover:scale-105"
                        priority
                    />
                </div>

                {/* Description (Creative Ghost / Double-Exposure Text Layer) */}
                <div className="relative max-w-sm md:max-w-md mx-auto mt-20 md:mt-24 text-center select-none">
                    {/* Ghost Offset Layer (Artistic Print Misregistration) */}
                    <p className="absolute left-[-10px] right-[10px] top-0 text-zinc-200/70 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider pointer-events-none">
                        A studio working between garment, shelter, and gesture, in Seoul.
                    </p>
                    {/* Main Text Layer */}
                    <p className="relative text-zinc-900 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider z-10">
                        A studio working between garment, shelter, and gesture, in Seoul.
                    </p>
                    {/* 커스텀 메이드 안내 — 본문보다 한 톤 물러선 한 줄 */}
                    <p className="relative mt-4 text-zinc-400 font-sans text-[10px] md:text-xs leading-relaxed tracking-wider z-10">
                        Custom-made pieces on request.
                    </p>
                </div>

                {/* 스튜디오 사실 네 줄 — 라벨은 옅게, 내용은 본문 톤으로 */}
                <dl className="mt-16 md:mt-20 space-y-3 text-center font-sans text-[10px] md:text-xs leading-relaxed tracking-wider">
                    {ABOUT_FACTS.map(({ label, value }) => (
                        <div key={label}>
                            {label && <dt className="inline text-zinc-400">{label} — </dt>}
                            <dd className="inline text-zinc-900">{value}</dd>
                        </div>
                    ))}
                </dl>

                {/* Archival Metadata Section (Three-Pillar Architectural Columns) */}
                <div className="mt-20 md:mt-24 flex flex-wrap items-center justify-center gap-x-16 md:gap-x-24 gap-y-3 w-full mx-auto text-center">
                    <span className="text-zinc-900 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider">
                        CAGE3000
                    </span>

                    <a
                        href="https://instagram.com/cage3k"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-900 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider hover:text-black border-b border-transparent hover:border-black transition-colors"
                    >
                        @cage3k
                    </a>

                    <a
                        href="mailto:contact@cage3000.com"
                        className="text-zinc-900 font-sans text-xs md:text-sm font-medium leading-relaxed tracking-wider hover:text-black border-b border-transparent hover:border-black transition-colors"
                    >
                        contact@cage3000.com
                    </a>
                </div>

            </section>
        </div>
    );
}
