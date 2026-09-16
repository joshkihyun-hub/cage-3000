import Link from 'next/link';
import { items } from '@/shared/constants/shop-items';
import { SITE_URL, pageMetadata, toJsonLd } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'FAQ',
  description:
    'CAGE3000 자주 묻는 질문 — 주문 제작 방식, 제작·배송 기간, 소재, 사이즈, 가격, 취소와 환불. 서울 기반 디자이너 패션 브랜드.',
  path: '/faq',
});

// 답변은 약관(제5·6조)과 환불 정책에 적힌 내용을 그대로 따른다 — 두 곳이 어긋나면
// 고객에게도, 검색·AI 답변에도 잘못된 정보가 나간다.
// 같은 배열이 화면과 구조화 데이터를 모두 채운다.
function buildFaqs() {
  const prices = [...new Set(items.map((item) => item.priceNum))].sort((a, b) => a - b);
  const priceRange = prices.map((price) => `₩${price.toLocaleString('ko-KR')}`).join(', ');

  return [
    {
      q: '주문 제작(made to order)은 어떻게 진행되나요?',
      a: 'CAGE3000의 모든 제품은 주문이 들어온 뒤 한 점씩 만듭니다. 결제가 완료되면 4~6 영업일 이내에 제작이 진행되고, 제작이 끝나는 순서대로 배송됩니다.',
      en: 'Every CAGE3000 piece is made after the order is placed. Production runs within 4–6 business days of payment, and pieces ship as they are finished.',
    },
    {
      q: '배송은 얼마나 걸리나요?',
      a: '제작이 끝난 뒤 통상 1~3 영업일 이내에 도착합니다. 지역과 상황에 따라 달라질 수 있습니다. 배송비는 주문 시 안내되는 기준을 따릅니다.',
      en: 'Delivery usually takes 1–3 business days after production is complete, depending on the region.',
    },
    {
      q: '소재는 무엇인가요?',
      a: '현재 컬렉션의 겉감은 수리 알파카 40%와 울 60%, 안감은 면 100%입니다.',
      en: 'In the current collection the outer fabric is 40% Suri Alpaca and 60% wool, with a 100% cotton lining.',
    },
    {
      q: '사이즈는 어떻게 되나요?',
      a: '현재 컬렉션은 원 사이즈(One Size)로 제작됩니다.',
      en: 'The current collection is made in one size.',
    },
    {
      q: '가격은 얼마인가요?',
      a: `현재 컬렉션의 가격은 ${priceRange}입니다. 상품별 가격은 각 제품 페이지에서 확인하실 수 있습니다.`,
      en: `Current collection prices are ${priceRange}.`,
    },
    {
      q: '주문을 취소할 수 있나요?',
      a: '결제 후 24시간 이내이고 제작이 시작되기 전이라면 전액 취소가 가능합니다. 제작이 시작된 뒤에는 주문 제작 특성상 취소가 불가합니다.',
      en: 'Orders can be cancelled in full within 24 hours of payment, before production begins. Once production starts, the made-to-order piece cannot be cancelled.',
    },
    {
      q: '교환이나 환불이 되나요?',
      a: '배송 중 파손, 다른 상품이 배송된 경우, 제조상의 결함이 있는 경우에는 교환 또는 환불이 가능합니다. 단순 변심이나 착용 후 반품은 어렵습니다.',
      en: 'Exchanges and refunds are available for damage in transit, a wrong item, or a manufacturing defect — not for a change of mind or after wear.',
    },
    {
      q: '결제 수단은 무엇이 있나요?',
      a: '신용카드와 카카오페이, 네이버페이 등을 이용하실 수 있습니다.',
      en: 'Credit card, KakaoPay and NaverPay are accepted.',
    },
    {
      q: 'CAGE3000은 어떤 브랜드인가요?',
      a: 'CAGE3000(케이지3000)은 서울 연희동을 기반으로 디자이너 김기현이 이끄는 디자이너 패션 브랜드입니다. 조각적인 실루엣의 의상과 헤드웨어를 주문 제작으로 한 점씩 만듭니다.',
      en: 'CAGE3000 is a designer fashion brand based in Seoul, led by designer Kihyun Kim — garments and headwear, made to order, one piece at a time.',
    },
    {
      q: '문의는 어디로 하면 되나요?',
      a: 'contact@cage3000.com 으로 메일 주시면 됩니다. 인스타그램은 @cage3k 입니다.',
      en: 'Email contact@cage3000.com, or find us on Instagram at @cage3k.',
    },
  ];
}

function faqJsonLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq`,
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: `${faq.a} ${faq.en}` },
    })),
  };
}

export default function FaqPage() {
  const faqs = buildFaqs();

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(faqJsonLd(faqs)) }}
      />

      <div className="max-w-screen-md mx-auto px-6 md:px-12">
        <h1 className="text-xs md:text-sm tracking-widest uppercase">FAQ</h1>
        <p className="mt-2 text-[10px] md:text-xs tracking-widest text-zinc-400 uppercase">
          CAGE3000 — Designer fashion from Seoul, made to order
        </p>

        <div className="mt-12 md:mt-16 space-y-8 md:space-y-10">
          {faqs.map((faq) => (
            <section key={faq.q} className="space-y-2">
              <h2 className="text-xs md:text-sm">{faq.q}</h2>
              <p className="text-[11px] md:text-xs text-zinc-600 leading-relaxed">{faq.a}</p>
              <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">{faq.en}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 md:mt-20 flex flex-wrap gap-x-8 gap-y-3">
          <Link href="/shop" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">
            Shop →
          </Link>
          <Link href="/refund" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">
            환불 및 취소 정책 →
          </Link>
          <Link href="/terms" className="text-[10px] md:text-xs uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">
            이용약관 →
          </Link>
        </div>
      </div>
    </div>
  );
}
