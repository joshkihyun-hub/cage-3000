export const metadata = {
  title: '개인정보처리방침 | CAGE3000',
  description: 'CAGE3000 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen pt-36 pb-24">
      <div className="max-w-2xl mx-auto px-6 md:px-8">
        <h1 className="text-3xl text-black mb-2 tracking-widest uppercase">개인정보처리방침</h1>
        <p className="text-[10px] text-zinc-400 mb-12 tracking-wide">최종 업데이트: 2025년 07월 27일</p>

        <div className="space-y-10 text-[13px] text-zinc-600 leading-relaxed">

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제1조 (개인정보의 처리 목적)</h2>
            <p className="mb-2">케이에이치엔(KHN, 이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하는 개인정보는 다음의 목적 이외의 용도로 사용되지 않으며, 이용 목적이 변경될 경우 별도의 동의를 받겠습니다.</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>회원 가입 및 관리</li>
              <li>상품 주문·결제·배송 처리</li>
              <li>고객 문의 및 불만 처리</li>
              <li>서비스 개선 및 마케팅 활용 (동의 시)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제2조 (수집하는 개인정보의 항목)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2 pr-4 text-black font-medium">구분</th>
                    <th className="text-left py-2 pr-4 text-black font-medium">수집 항목</th>
                    <th className="text-left py-2 text-black font-medium">수집 방법</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-2 pr-4 align-top">필수</td>
                    <td className="py-2 pr-4 align-top">이름, 이메일, 비밀번호, 배송지 주소, 전화번호</td>
                    <td className="py-2 align-top">회원가입, 주문</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top">결제</td>
                    <td className="py-2 pr-4 align-top">결제 수단 정보 (카드사 등 PG사 처리)</td>
                    <td className="py-2 align-top">결제 시</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top">자동 수집</td>
                    <td className="py-2 pr-4 align-top">IP 주소, 쿠키, 방문 기록, 기기 정보</td>
                    <td className="py-2 align-top">서비스 이용</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제3조 (개인정보의 보유 및 이용기간)</h2>
            <ul className="list-disc list-inside space-y-1.5">
              <li>회원 정보: 회원 탈퇴 시까지 (단, 관련 법령에 따라 보존 필요 시 해당 기간)</li>
              <li>주문·결제 기록: 전자상거래법에 따라 5년 보관</li>
              <li>소비자 불만 및 분쟁 기록: 전자상거래법에 따라 3년 보관</li>
              <li>접속 로그: 통신비밀보호법에 따라 3개월 보관</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제4조 (개인정보의 제3자 제공)</h2>
            <p className="mb-2">회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 다음의 경우는 예외로 합니다.</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>이용자가 사전에 동의한 경우</li>
              <li>배송업체: 상품 배송을 위해 수령인 이름, 주소, 전화번호 제공</li>
              <li>결제대행사(포트원/PG사): 결제 처리를 위한 최소한의 정보 제공</li>
              <li>법령에 의하여 요구되는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제5조 (개인정보 처리의 위탁)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2 pr-4 text-black font-medium">수탁업체</th>
                    <th className="text-left py-2 text-black font-medium">위탁 업무</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-2 pr-4">(주)포트원</td>
                    <td className="py-2">결제 처리 및 검증</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">택배사(국내)</td>
                    <td className="py-2">상품 배송</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제6조 (개인정보의 국외 이전)</h2>
            <p className="mb-3">회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보를 국외로 이전(처리위탁·보관)하고 있습니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200">
                    <th className="text-left py-2 pr-4 text-black font-medium">이전받는 자 (국가)</th>
                    <th className="text-left py-2 pr-4 text-black font-medium">이전 항목</th>
                    <th className="text-left py-2 pr-4 text-black font-medium">이전 목적</th>
                    <th className="text-left py-2 text-black font-medium">보유·이용기간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="py-2 pr-4 align-top">Resend, Inc. (미국)</td>
                    <td className="py-2 pr-4 align-top">이메일 주소, 이름, 주문 정보</td>
                    <td className="py-2 pr-4 align-top">주문확인·인증 메일 발송</td>
                    <td className="py-2 align-top">위탁계약 종료 또는 회원 탈퇴 시까지</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top">Vercel Inc. (미국)</td>
                    <td className="py-2 pr-4 align-top">서비스 이용 시 입력·생성되는 개인정보</td>
                    <td className="py-2 pr-4 align-top">웹사이트 호스팅·운영</td>
                    <td className="py-2 align-top">위탁계약 종료 시까지</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-zinc-400">
              * 이전 일시 및 방법: 서비스 이용·주문 시점에 정보통신망을 통해 전송. 이용자는 국외 이전을 거부할 수 있으며, 거부 시 회원가입·주문 등 일부 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제7조 (정보주체의 권리·의무)</h2>
            <p className="mb-2">이용자는 개인정보 주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>개인정보 열람 요구</li>
              <li>오류 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리 정지 요구</li>
            </ul>
            <p className="mt-3">권리 행사는 아래 개인정보 보호책임자에게 이메일로 요청하실 수 있으며, 지체 없이 조치하겠습니다.</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제8조 (쿠키의 사용)</h2>
            <p>
              회사는 서비스 제공을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 일부 서비스 이용이 제한될 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-black mb-3 uppercase tracking-widest">제9조 (개인정보 보호책임자)</h2>
            <div className="bg-zinc-50 rounded p-4 text-[12px] space-y-1">
              <p><span className="text-zinc-800 font-medium">성명</span> &nbsp;김기현</p>
              <p><span className="text-zinc-800 font-medium">직위</span> &nbsp;대표</p>
              <p><span className="text-zinc-800 font-medium">이메일</span> &nbsp;contact@cage3000.com</p>
              <p><span className="text-zinc-800 font-medium">사업장</span> &nbsp;서울특별시 서대문구 연희로11사길 13 (연희동)</p>
            </div>
          </section>

          <section className="pt-6 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-400">
              본 방침은 2025년 07월 27일부터 적용됩니다. 개인정보 관련 문의는{' '}
              <a href="mailto:contact@cage3000.com" className="underline hover:text-black transition-colors">
                contact@cage3000.com
              </a>
              으로 연락 주시기 바랍니다.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
