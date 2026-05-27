export const metadata = {
  title: '환불 및 취소 정책 | CAGE3000',
  description: 'CAGE3000 환불 및 취소 정책',
};

export default function RefundPage() {
  return (
    <div className="bg-white min-h-screen pt-36 pb-24">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <h1 className="text-3xl text-black mb-2 tracking-widest uppercase">환불 및 취소 정책</h1>
        <p className="text-[10px] text-zinc-400 mb-12 tracking-wide">최종 업데이트: 2025년 07월 27일</p>

        <div className="space-y-10 text-[13px] text-zinc-600 leading-relaxed">

          {/* Notice */}
          <section className="bg-zinc-50 border border-zinc-200 rounded p-5">
            <p className="text-[12px] text-zinc-700 leading-relaxed">
              <span className="font-semibold text-black">중요 안내:</span> CAGE3000의 모든 상품은 <strong>주문 제작(Made-to-Order)</strong> 방식으로 제작됩니다.
              주문 확정 후 제작이 즉시 시작되므로, 단순 변심에 의한 취소·환불은 원칙적으로 불가합니다. 구매 전 상품 정보를 충분히 확인해 주시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제1조 (주문 취소)</h2>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="text-black font-semibold shrink-0">결제 후 24시간 이내</span>
                <span>제작이 시작되기 전이라면 전액 취소 가능. 이메일로 즉시 요청 바랍니다.</span>
              </div>
              <div className="flex gap-3">
                <span className="text-black font-semibold shrink-0">제작 시작 후</span>
                <span>제작이 개시된 이후에는 취소가 불가합니다. (주문 맞춤 제작 특성상)</span>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제2조 (교환 및 환불 가능 사유)</h2>
            <p className="mb-3">아래의 경우에는 수령일로부터 <strong>7일 이내</strong>에 교환 또는 환불 요청이 가능합니다.</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>배송 중 파손 또는 훼손된 경우</li>
              <li>주문한 상품과 다른 상품이 배송된 경우</li>
              <li>상품에 제조상의 결함이 있는 경우</li>
            </ul>
            <p className="mt-3 text-[12px] text-zinc-400">
              * 위 사유 해당 시 상품 사진과 함께 contact@cage3000.com으로 연락 주시면 빠르게 처리해 드리겠습니다.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제3조 (교환 및 환불 불가 사유)</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>단순 변심 (색상·디자인 등 개인 취향 차이)</li>
              <li>고객의 부주의로 인한 상품 훼손·오염</li>
              <li>착용 후 반품 요청</li>
              <li>주문 제작 상품의 경우 (맞춤 제작 특성)</li>
              <li>반품 배송 중 파손된 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제4조 (환불 절차 및 기간)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>고객이 환불 요청 이메일 발송 (사유 및 사진 첨부)</li>
              <li>회사 검토 후 환불 승인 안내 (영업일 기준 1~3일)</li>
              <li>상품 반송 (배송비는 사유에 따라 상이)</li>
              <li>상품 수령 및 검수 완료 후 환불 처리</li>
              <li>결제 수단별 환불 완료 (카드: 3~5 영업일, 간편결제: 1~3 영업일 소요)</li>
            </ol>
            <div className="mt-4 bg-zinc-50 rounded p-4 text-[12px] space-y-1">
              <p><span className="font-medium text-black">회사 귀책 사유</span> — 반품 배송비 회사 부담</p>
              <p><span className="font-medium text-black">고객 귀책 사유</span> — 왕복 배송비 고객 부담</p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제5조 (소비자 피해 보상)</h2>
            <p>
              본 정책에서 정하지 않은 사항은 공정거래위원회의 <strong>소비자분쟁해결기준</strong>에 따릅니다. 분쟁 발생 시 한국소비자원(www.kca.go.kr)에 분쟁조정을 신청하실 수 있습니다.
            </p>
          </section>

          <section className="pt-6 border-t border-zinc-100">
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">환불 문의</h2>
            <div className="text-[12px] space-y-1">
              <p><span className="text-zinc-600 font-medium">이메일</span> &nbsp;contact@cage3000.com</p>
              <p><span className="text-zinc-600 font-medium">운영시간</span> &nbsp;평일 10:00 – 18:00 (주말·공휴일 제외)</p>
              <p className="text-zinc-400 mt-2">케이에이치엔(KHN) 대표 김기현 &nbsp;|&nbsp; 사업자번호 830-32-01740</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
