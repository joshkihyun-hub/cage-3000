export const metadata = {
  title: '이용약관 | CAGE3000',
  description: 'CAGE3000 이용약관',
};

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen pt-36 pb-24">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <h1 className="font-serif text-3xl text-black mb-2 tracking-widest uppercase">이용약관</h1>
        <p className="text-[10px] text-zinc-400 mb-12 tracking-wide">최종 업데이트: 2025년 07월 27일</p>

        <div className="space-y-10 text-[13px] text-zinc-600 leading-relaxed">

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제1조 (목적)</h2>
            <p>
              본 약관은 케이에이치엔(KHN, 이하 "회사")이 운영하는 CAGE3000 웹사이트(이하 "사이트")에서 제공하는 서비스 이용과 관련하여 회사와 이용자 간의 권리·의무 및 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제2조 (정의)</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>"사이트"란 회사가 재화 또는 서비스를 이용자에게 제공하기 위하여 운영하는 가상의 영업장을 의미합니다.</li>
              <li>"이용자"란 사이트에 접속하여 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
              <li>"회원"이란 사이트에 회원가입을 한 자로서, 계속적으로 회사가 제공하는 서비스를 이용할 수 있는 자를 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제3조 (약관의 효력 및 변경)</h2>
            <p>
              본 약관은 사이트에 게시함으로써 효력을 발생합니다. 회사는 합리적인 사유가 있을 경우 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할 수 있으며, 변경된 약관은 사이트에 공시됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제4조 (서비스의 제공)</h2>
            <p className="mb-2">회사는 다음과 같은 서비스를 제공합니다.</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>예술 작품 및 무대의상 등 상품의 판매</li>
              <li>상품 주문 및 결제 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제5조 (주문 및 결제)</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>이용자는 사이트에서 제공하는 방법으로 상품을 주문하고 결제할 수 있습니다.</li>
              <li>회사는 이용자의 주문에 대하여 주문 확인 메일 또는 기타 방법으로 확인 통보를 합니다.</li>
              <li>결제는 신용카드, 카카오페이, 네이버페이 등 사이트에서 정한 결제 수단을 이용할 수 있습니다.</li>
              <li>모든 상품은 주문 제작 방식으로 운영되며, 결제 완료 후 4~6 영업일 이내에 제작이 진행됩니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제6조 (배송)</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>상품은 제작 완료 후 회사가 지정한 배송업체를 통해 발송됩니다.</li>
              <li>배송 기간은 제작 완료 후 통상 1~3 영업일 이내이나, 지역 및 상황에 따라 달라질 수 있습니다.</li>
              <li>배송비는 주문 시 안내되는 기준에 따릅니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제7조 (취소 및 환불)</h2>
            <p>
              취소·환불·교환에 관한 구체적인 사항은 <a href="/refund" className="underline hover:text-black transition-colors">환불 및 취소 정책</a>을 참조하시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제8조 (개인정보 보호)</h2>
            <p>
              회사는 이용자의 개인정보를 중요시하며 관련 법령에 따라 이를 보호합니다. 개인정보 처리에 관한 사항은 <a href="/privacy" className="underline hover:text-black transition-colors">개인정보처리방침</a>을 참조하시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제9조 (면책조항)</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>회사는 천재지변, 전쟁, 기타 불가항력적 사유로 인하여 서비스를 제공할 수 없는 경우에는 책임이 면제됩니다.</li>
              <li>이용자의 귀책 사유로 인한 서비스 이용 장애에 대하여 회사는 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제10조 (분쟁 해결)</h2>
            <p>
              본 약관과 관련한 분쟁은 대한민국 법령을 준거법으로 하며, 분쟁 발생 시 서울중앙지방법원을 관할 법원으로 합니다.
            </p>
          </section>

          <section className="pt-6 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400">
              문의: <a href="mailto:contact@cage3000.com" className="underline hover:text-black transition-colors">contact@cage3000.com</a>
              &nbsp;|&nbsp; 케이에이치엔(KHN) 대표 김기현 &nbsp;|&nbsp; 사업자번호 830-32-01740
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
