import { KCP_TRANSFER_ENABLED } from '@/lib/escrow';

// 결제 수단 설정 — 결제 화면과 안내 문구(FAQ·이용약관)가 같은 값을 읽도록 한곳에 둔다.
// 서버(안내 페이지)와 브라우저(결제 화면) 양쪽에서 읽으므로 서버 전용 모듈을 import하지 않는다.

// 신용카드는 KCP V2 채널. 환경에 따라 테스트연동/실연동 채널 키를 환경변수로 주입한다.
export const CHANNEL_KCP = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KCP || '';
// KCP 채널로 받을 간편결제 — KCP에 간편결제를 추가 계약한 뒤에만 넣는다(예: "KAKAOPAY,NAVERPAY,TOSSPAY").
// 계약 전에 KCP로 보내면 결제창이 [DR02] 가맹점 설정정보 오류로 끝난다(2026-05 실제로 그랬다).
const KCP_EASY_PAY = new Set(
  (process.env.NEXT_PUBLIC_PORTONE_KCP_EASY_PAY || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean)
);
// 간편결제 — 직접 계약한 채널(포트원 콘솔에서 따로 연결)이 있으면 그 채널, 없으면 위 목록에 있을 때만 KCP 채널.
// 둘 다 없는 수단은 화면에 띄우지 않는다. 계약이 끝나 채널이 생기면 환경변수만 넣으면 나타난다.
export const EASY_PAY_OPTIONS = [
  { label: '카카오페이', labelEn: 'KakaoPay', provider: 'KAKAOPAY', channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KAKAOPAY },
  { label: '네이버페이', labelEn: 'NaverPay', provider: 'NAVERPAY', channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_NAVERPAY },
  { label: '토스페이', labelEn: 'Toss Pay', provider: 'TOSSPAY', channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_TOSSPAY },
  { label: '페이코', labelEn: 'PAYCO', provider: 'PAYCO' },
  { label: '삼성페이', labelEn: 'Samsung Pay', provider: 'SAMSUNGPAY' },
  { label: '애플페이', labelEn: 'Apple Pay', provider: 'APPLEPAY' },
]
  .map((option) => ({
    ...option,
    direct: Boolean(option.channelKey),
    channelKey: option.channelKey || (KCP_EASY_PAY.has(option.provider) ? CHANNEL_KCP : ''),
  }))
  .filter((option) => option.channelKey);

// 지금 받는 결제 수단 이름 — FAQ·이용약관 문구가 여기서 만들어져 결제 화면과 어긋나지 않는다.
// 신용카드는 기본 계약이라 늘 들어간다.
export const PAYMENT_METHOD_NAMES = [
  { ko: '신용카드', en: 'credit card' },
  ...(KCP_TRANSFER_ENABLED ? [{ ko: '계좌이체', en: 'bank transfer' }] : []),
  ...EASY_PAY_OPTIONS.map((option) => ({ ko: option.label, en: option.labelEn })),
];
