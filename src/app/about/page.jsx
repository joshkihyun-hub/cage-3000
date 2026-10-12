import Image from 'next/image';
import { grotesk } from '@/shared/fonts';
import CommissionInquiry from '@/components/commission-inquiry';
import { items } from '@/shared/constants/shop-items';
import { FieldNotesNumber } from '@/components/field-notes';

// 세계관 — CAGE3000은 평생 3000점을 만든다. 피스에는 이름 없이 번호만 붙고 번호는 작업 전체에
// 이어진다(GREEN 01~09 → QUARTERS 10~). 지금까지 만든 마지막 번호 / 3000 — 상품이 늘면 저절로 오른다.
const PIECES_TOTAL = 3000;
const PIECES_MADE = Math.max(...items.map((item) => Number(item.name) || 0));

const lineLink = 'hover:underline underline-offset-2 decoration-1';

// 두 단 — 왼쪽엔 작은 흑백 사진 한 장, 오른쪽 절반에 작은 글씨 세 덩어리(소개 · 연락처 · 스튜디오 주소).
export default function AboutPage() {
    return (
        <div className={`${grotesk.className} bg-white text-black min-h-screen pt-32 md:pt-40 pb-40`}>
            {/* 화면엔 제목을 두지 않는 디자인 — 검색엔진·스크린리더용 제목만 숨겨 둔다(Collections와 같은 방식). */}
            <h1 className="sr-only">About CAGE3000</h1>
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

                    <div className="max-w-[22rem]">
                        {/* 숫자를 누르면 다음 번호를 먼저 받는 구독 칸이 열린다(Field Notes). */}
                        <FieldNotesNumber made={PIECES_MADE} total={PIECES_TOTAL}>
                            <p className="text-zinc-400">
                                Every piece is given a number, never a name. The studio will make three&nbsp;thousand.
                            </p>
                        </FieldNotesNumber>
                    </div>

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
