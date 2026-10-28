// 계좌이체(KCP 실시간 계좌이체)와 구매안전서비스(에스크로) 표시를 한꺼번에 켜고 끄는 스위치.
// 계좌이체 같은 현금성 선결제는 금액과 관계없이 구매안전서비스를 제공해야 해서(전자상거래법 —
// 신용카드는 예외) 계좌이체는 에스크로로만 받는다. KCP 에스크로 승인(2026-10-29 신청) 뒤 Vercel에
// NEXT_PUBLIC_PORTONE_KCP_TRANSFER=1 을 넣고 다시 배포하면 결제 버튼·푸터 표시·환불 기간이 함께 나타난다.
// 서버(푸터·환불 페이지)와 브라우저(결제 화면) 양쪽에서 읽으므로 서버 전용 모듈을 import하지 않는다.
export const KCP_TRANSFER_ENABLED = process.env.NEXT_PUBLIC_PORTONE_KCP_TRANSFER === '1';

// 결제 화면에 띄우는 구매안전서비스 안내 — 가입 사실은 초기 화면(푸터)과 결제 화면에 표시해야 한다.
export const ESCROW_NOTICE = '계좌이체는 NHN KCP 구매안전서비스(에스크로)로 결제됩니다.';
