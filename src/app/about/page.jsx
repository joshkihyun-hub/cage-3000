import Image from 'next/image';
import { grotesk } from '@/shared/fonts';
import CommissionInquiry from '@/components/commission-inquiry';

const lineLink = 'hover:underline underline-offset-2 decoration-1';

// 두 단 — 왼쪽엔 작은 흑백 사진 한 장, 오른쪽 절반에 작은 글씨 세 덩어리(소개 · 연락처 · 스튜디오 주소).
export default function AboutPage() {
    return (
        <div className={`${grotesk.className} bg-white text-black min-h-screen pt-32 md:pt-44 pb-40`}>
            <div className="px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-y-12">
                <div className="relative w-28 md:w-[150px] aspect-[4/5] overflow-hidden">
                    <Image
                        src="/about_profile.png"
                        alt="Kihyun Kim"
                        fill
                        sizes="150px"
                        priority
                        className="object-cover object-[38%_center] grayscale"
                    />
                </div>

                <div className="text-[12px] md:text-[13px] font-medium leading-[1.3] tracking-[-0.005em] space-y-[2.6em]">
                    <p className="max-w-[22rem]">
                        A studio working between garment, shelter, and gesture, in&nbsp;Seoul.
                    </p>

                    <div className="flex flex-col items-start">
                        <a href="mailto:contact@cage3000.com" className={lineLink}>contact@cage3000.com</a>
                        <a href="https://instagram.com/cage3k" target="_blank" rel="noopener noreferrer" className={lineLink}>
                            Instagram
                        </a>
                        <CommissionInquiry className={grotesk.className} triggerClassName={`text-left ${lineLink}`}>
                            Commission inquiry
                        </CommissionInquiry>
                    </div>

                    <address className="not-italic">
                        13, Yeonhui-ro 11sa-gil
                        <br />
                        Seodaemun-gu, Seoul
                        <br />
                        Republic of Korea
                    </address>
                </div>
            </div>
        </div>
    );
}
