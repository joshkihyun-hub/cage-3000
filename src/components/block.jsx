// 사이트 공용 레이아웃 프리미티브 — 검정 ㄱ자(상단+좌측) 라인 섹션.
// 로그인·장바구니·상품 패널에서 쓰던 패턴을 전 페이지 공용으로 승격.
export function Block({ children, className = '' }) {
  return (
    <section className={`border-t border-l border-zinc-900 pt-2 pl-3 pb-4 ${className}`}>
      {children}
    </section>
  );
}
