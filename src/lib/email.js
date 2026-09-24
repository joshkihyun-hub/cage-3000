import { Resend } from 'resend';

let cachedClient = null;
function getClient() {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  cachedClient = new Resend(apiKey);
  return cachedClient;
}

// 발신 주소. 도메인 verify가 끝나면 noreply@cage3000.com 같은 값으로 바꾸면 됨.
// Resend sandbox 모드에서는 onboarding@resend.dev로 보내야 하고
// 수신자도 본인 계정 이메일만 가능하다는 점에 유의.
const FROM = process.env.EMAIL_FROM || 'CAGE3000 <onboarding@resend.dev>';
// 사용자가 메일에 답장했을 때 받을 수 있는 실제 주소.
// noreply@... 에서 보내고 reply-to를 contact@... 로 두는 게 표준.
const REPLY_TO = process.env.EMAIL_REPLY_TO || null;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXTAUTH_URL ||
  'https://cage3000.com';

export async function sendEmail({ to, subject, html, text, replyTo }) {
  const client = getClient();
  const payload = {
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
  };
  // Resend SDK v4+ uses camelCase (`replyTo`, not `reply_to`).
  // 호출 쪽이 넘긴 replyTo(예: 문의자 주소)가 기본 회신 주소보다 우선한다.
  if (replyTo || REPLY_TO) payload.replyTo = replyTo || REPLY_TO;

  const { data, error } = await client.emails.send(payload);
  if (error) {
    console.error('[email] Resend returned error', error);
    const msg = error.message || JSON.stringify(error);
    throw new Error(`Resend send failed: ${msg}`);
  }
  return data;
}

function shellTemplate({ headline, body, ctaLabel, ctaUrl, footnote }) {
  const safeFootnote =
    footnote ||
    '본 메일은 발신 전용입니다. 문의는 contact@cage3000.com 으로 부탁드립니다.';
  return `
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${headline}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
            <tr>
              <td style="padding:0 0 32px 0;border-bottom:1px solid #e4e4e7;">
                <p style="margin:0;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#000;">CAGE3000</p>
              </td>
            </tr>
            <tr>
              <td style="padding:48px 0 16px 0;">
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:28px;line-height:1.3;color:#000;">${headline}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 0 32px 0;font-size:14px;line-height:1.7;color:#3f3f46;">
                ${body}
              </td>
            </tr>
            ${
              ctaLabel && ctaUrl
                ? `<tr>
                    <td style="padding:0 0 32px 0;">
                      <a href="${ctaUrl}" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:14px 32px;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;">${ctaLabel}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 32px 0;font-size:12px;color:#71717a;line-height:1.6;word-break:break-all;">
                      버튼이 동작하지 않으면 아래 링크를 복사해 브라우저에 붙여넣어 주세요:<br/>
                      <span style="color:#3f3f46;">${ctaUrl}</span>
                    </td>
                  </tr>`
                : ''
            }
            <tr>
              <td style="padding:32px 0 0 0;border-top:1px solid #e4e4e7;font-size:11px;color:#a1a1aa;line-height:1.6;">
                ${safeFootnote}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 0 0 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#d4d4d8;">
                &copy; ${new Date().getFullYear()} CAGE3000 / KHN
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendVerificationEmail({ to, name, token }) {
  const url = `${SITE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
  const greeting = name ? `${name}님,` : '안녕하세요,';
  const html = shellTemplate({
    headline: 'Welcome to CAGE3000',
    body: `
      <p style="margin:0 0 20px 0;">${greeting}</p>
      <p style="margin:0 0 20px 0;">CAGE3000 가족이 되어 주셔서 진심으로 감사드립니다. 서울에서 한 점 한 점 손으로 다듬어 만든 모자를, 이제 가장 먼저 만나보실 수 있어요.</p>
      <p style="margin:0 0 20px 0;">계정을 활성화하려면 아래 버튼으로 이메일을 인증해 주세요. 링크는 <strong>24시간</strong> 동안 유효합니다.</p>
    `,
    ctaLabel: 'Verify Email',
    ctaUrl: url,
    footnote: '본인이 가입하지 않으셨다면 이 메일은 무시해 주세요. 계정은 활성화되지 않습니다. 문의는 contact@cage3000.com 으로 부탁드립니다.',
  });
  return sendEmail({
    to,
    subject: '[CAGE3000] 가입을 환영합니다 — 이메일 인증을 완료해 주세요',
    html,
    text: `${greeting}\n\nCAGE3000에 가입해 주셔서 감사합니다.\n계정 활성화를 위해 아래 링크로 이메일을 인증해 주세요. (24시간 유효)\n\n${url}`,
  });
}

const formatKRW = (n) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(Number(n) || 0);

function joinAddress({ zipCode, address, detail }) {
  const parts = [];
  if (zipCode) parts.push(`(${zipCode})`);
  if (address) parts.push(address);
  if (detail) parts.push(detail);
  return parts.join(' ');
}

export async function sendOrderConfirmationEmail({
  to,
  name,
  orderNumber,
  totalAmount,
  items = [],
  shipping = null, // { recipientName, recipientPhone, zipCode, address, detail, customerNote }
}) {
  const greeting = name ? `${name}님,` : '안녕하세요,';

  const itemsRows = items
    .map(
      (it) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:13px;color:#27272a;">${it.productName} <span style="color:#a1a1aa;">× ${it.quantity}</span></td>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:13px;color:#27272a;text-align:right;">${formatKRW(it.subtotal)}</td>
        </tr>`
    )
    .join('');

  const lookupUrl = `${SITE_URL}/my-page`;

  const shippingBlock = shipping
    ? `
    <p style="margin:24px 0 8px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a1a1aa;">Shipping To</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#27272a;line-height:1.7;">
      <tr><td>${shipping.recipientName || ''} · ${shipping.recipientPhone || ''}</td></tr>
      <tr><td style="color:#52525b;">${joinAddress({ zipCode: shipping.zipCode, address: shipping.address, detail: shipping.detail })}</td></tr>
      ${shipping.customerNote ? `<tr><td style="padding-top:6px;color:#71717a;font-size:12px;">메모: ${shipping.customerNote}</td></tr>` : ''}
    </table>
  `
    : '';

  const body = `
    <p style="margin:0 0 20px 0;">${greeting}</p>
    <p style="margin:0 0 20px 0;">CAGE3000에서 주문을 접수했습니다. 결제가 정상적으로 완료되었음을 확인했어요.</p>
    <p style="margin:0 0 24px 0;font-size:13px;color:#71717a;">주문번호 <strong style="color:#000;letter-spacing:0.05em;">${orderNumber}</strong></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e4e7;margin:0 0 8px 0;">
      ${itemsRows}
      <tr>
        <td style="padding:16px 0 0 0;font-size:13px;font-weight:600;color:#000;">합계</td>
        <td style="padding:16px 0 0 0;font-size:15px;font-weight:600;color:#000;text-align:right;">${formatKRW(totalAmount)}</td>
      </tr>
    </table>
    ${shippingBlock}
    <p style="margin:24px 0 0 0;font-size:13px;color:#52525b;">상품은 준비 완료되는 대로 안내드릴게요. 추가 문의는 contact@cage3000.com 으로 회신 주세요.</p>
  `;

  const html = shellTemplate({
    headline: 'Order Confirmed',
    body,
    ctaLabel: 'View Order',
    ctaUrl: lookupUrl,
    footnote:
      '본 메일은 결제 완료 시 자동 발송됩니다. 회신을 통해 언제든 문의해 주세요.',
  });

  return sendEmail({
    to,
    subject: `[CAGE3000] 주문이 접수되었습니다 — ${orderNumber}`,
    html,
    text: `${greeting}\n주문이 접수되었습니다.\n주문번호: ${orderNumber}\n합계: ${formatKRW(totalAmount)}\n\n주문 상세는 ${lookupUrl} 에서 확인하실 수 있습니다.`,
  });
}

// 판매자(운영자) 알림 메일. 결제 완료 직후 발송돼서 새 주문을 즉시 인지하고
// 어드민 페이지로 바로 진입할 수 있게 한다. 받는 주소는 ORDER_NOTIFY_EMAIL 환경변수
// (콤마로 다중 지정 가능). 기본값은 contact@cage3000.com.
export async function sendOrderNotificationToSeller({
  orderNumber,
  totalAmount,
  paymentMethod,
  paidAt,
  isGuest,
  buyer, // { name, email, phone }
  shipping, // { recipientName, recipientPhone, zipCode, address, detail, customerNote }
  items = [],
}) {
  const rawRecipients = process.env.ORDER_NOTIFY_EMAIL || 'contact@cage3000.com';
  const recipients = rawRecipients
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    console.warn('[email] ORDER_NOTIFY_EMAIL produced no valid recipients');
    return null;
  }

  const adminUrl = `${SITE_URL}/admin/orders`;

  const itemsRows = items
    .map(
      (it) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:13px;color:#27272a;">${it.productName} <span style="color:#a1a1aa;">× ${it.quantity}</span></td>
          <td style="padding:10px 0;border-bottom:1px solid #f4f4f5;font-size:13px;color:#27272a;text-align:right;">${formatKRW(it.subtotal)}</td>
        </tr>`
    )
    .join('');

  const guestBadge = isGuest
    ? `<span style="margin-left:8px;padding:2px 6px;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#71717a;border:1px solid #e4e4e7;">Guest</span>`
    : '';

  const body = `
    <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a1a1aa;">New Order</p>
    <p style="margin:0 0 24px 0;font-size:14px;color:#27272a;">새 주문이 결제 완료되었습니다.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;margin:0 0 24px 0;">
      <tr>
        <td style="padding:10px 0;font-size:12px;color:#71717a;width:90px;">주문번호</td>
        <td style="padding:10px 0;font-size:13px;color:#000;font-weight:600;letter-spacing:0.05em;">${orderNumber}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:12px;color:#71717a;">결제수단</td>
        <td style="padding:10px 0;font-size:13px;color:#27272a;">${paymentMethod || '-'}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:12px;color:#71717a;">결제시각</td>
        <td style="padding:10px 0;font-size:13px;color:#27272a;">${paidAt ? new Date(paidAt).toLocaleString('ko-KR') : '-'}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:12px;color:#71717a;">합계</td>
        <td style="padding:10px 0;font-size:15px;color:#000;font-weight:600;">${formatKRW(totalAmount)}</td>
      </tr>
    </table>

    <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a1a1aa;">Customer ${guestBadge}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
      <tr><td style="padding:4px 0;font-size:13px;color:#27272a;">${buyer?.name || '-'}</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#52525b;">${buyer?.email || '-'}</td></tr>
      <tr><td style="padding:4px 0;font-size:13px;color:#52525b;">${buyer?.phone || '-'}</td></tr>
    </table>

    <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a1a1aa;">Shipping</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;font-size:13px;color:#27272a;line-height:1.7;">
      <tr><td>${shipping?.recipientName || '-'} · ${shipping?.recipientPhone || '-'}</td></tr>
      <tr><td style="color:#52525b;">${joinAddress({ zipCode: shipping?.zipCode, address: shipping?.address, detail: shipping?.detail })}</td></tr>
      ${shipping?.customerNote ? `<tr><td style="padding-top:6px;color:#71717a;font-size:12px;">메모: ${shipping.customerNote}</td></tr>` : ''}
    </table>

    <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a1a1aa;">Items</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e4e7;margin:0 0 8px 0;">
      ${itemsRows}
      <tr>
        <td style="padding:16px 0 0 0;font-size:13px;font-weight:600;color:#000;">합계</td>
        <td style="padding:16px 0 0 0;font-size:15px;font-weight:600;color:#000;text-align:right;">${formatKRW(totalAmount)}</td>
      </tr>
    </table>
  `;

  const html = shellTemplate({
    headline: 'New Order Received',
    body,
    ctaLabel: 'Open Admin',
    ctaUrl: adminUrl,
    footnote:
      '본 메일은 결제 완료 시 운영자에게 자동 발송됩니다. 어드민에서 주문 처리 후 배송 정보를 입력해 주세요.',
  });

  return sendEmail({
    to: recipients,
    subject: `[CAGE3000] 새 주문 — ${orderNumber} · ${buyer?.name || '-'} · ${formatKRW(totalAmount)}`,
    html,
    text: `새 주문 결제 완료\n주문번호: ${orderNumber}\n구매자: ${buyer?.name || '-'} (${buyer?.email || '-'} / ${buyer?.phone || '-'})\n배송지: ${joinAddress({ zipCode: shipping?.zipCode, address: shipping?.address, detail: shipping?.detail })}\n합계: ${formatKRW(totalAmount)}\n\n어드민: ${adminUrl}`,
  });
}

export async function sendPasswordResetEmail({ to, name, token }) {
  const url = `${SITE_URL}/auth/reset-password?token=${encodeURIComponent(token)}`;
  const html = shellTemplate({
    headline: 'Reset your password',
    body: `
      <p style="margin:0 0 16px 0;">${name ? `${name}님, ` : ''}비밀번호 재설정 요청이 접수되었습니다.</p>
      <p style="margin:0 0 16px 0;">아래 버튼을 눌러 새 비밀번호를 설정해 주세요. 이 링크는 <strong>1시간</strong> 동안만 유효하며 한 번만 사용할 수 있습니다.</p>
    `,
    ctaLabel: 'Reset Password',
    ctaUrl: url,
    footnote: '본인이 요청하지 않았다면 이 메일은 무시해 주세요. 비밀번호는 변경되지 않습니다.',
  });
  return sendEmail({
    to,
    subject: '[CAGE3000] 비밀번호 재설정',
    html,
    text: `비밀번호 재설정 링크: ${url}\n링크는 1시간 동안 유효합니다.`,
  });
}

// 사용자가 입력한 문자열을 HTML 메일에 넣기 전에 이스케이프.
const escapeHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// 프로젝트 페이지의 커미션(커스텀 메이드) 문의 → 운영자에게 전달.
// 회신 주소를 문의자 이메일로 두어 메일함에서 바로 답장할 수 있게 한다.
// 받는 주소는 INQUIRY_NOTIFY_EMAIL → ORDER_NOTIFY_EMAIL → contact@cage3000.com 순.
export async function sendCommissionInquiry({ name, email, organization, message }) {
  const rawRecipients =
    process.env.INQUIRY_NOTIFY_EMAIL || process.env.ORDER_NOTIFY_EMAIL || 'contact@cage3000.com';
  const recipients = rawRecipients.split(',').map((s) => s.trim()).filter(Boolean);

  const row = (label, value) => `
      <tr>
        <td style="padding:10px 0;font-size:12px;color:#71717a;width:90px;vertical-align:top;">${label}</td>
        <td style="padding:10px 0;font-size:13px;color:#27272a;">${value}</td>
      </tr>`;

  const body = `
    <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a1a1aa;">Commission Inquiry</p>
    <p style="margin:0 0 24px 0;font-size:14px;color:#27272a;">프로젝트 페이지에서 새 제작 문의가 도착했습니다. 이 메일에 답장하면 문의자에게 바로 전달됩니다.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;margin:0 0 24px 0;">
      ${row('이름', escapeHtml(name))}
      ${row('이메일', `<a href="mailto:${escapeHtml(email)}" style="color:#000;">${escapeHtml(email)}</a>`)}
      ${organization ? row('소속·프로젝트', escapeHtml(organization)) : ''}
    </table>
    <p style="margin:0 0 8px 0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#a1a1aa;">Message</p>
    <div style="font-size:14px;line-height:1.7;color:#18181b;white-space:pre-wrap;">${escapeHtml(message)}</div>
  `;

  const html = shellTemplate({
    headline: 'New Commission Inquiry',
    body,
    footnote: '본 메일은 cage3000.com 프로젝트 페이지의 문의 양식에서 자동 발송됩니다.',
  });

  return sendEmail({
    to: recipients,
    replyTo: email,
    subject: `[CAGE3000] 제작 문의 — ${name}${organization ? ` · ${organization}` : ''}`,
    html,
    text: `제작 문의\n이름: ${name}\n이메일: ${email}${organization ? `\n소속·프로젝트: ${organization}` : ''}\n\n${message}`,
  });
}

// 주문 진행 알림 — 관리자가 주문 상태를 '제작 중' 또는 '배송 중'으로 바꾸는 순간 고객에게 간다.
// 회원은 마이페이지, 비회원은 주문조회 페이지로 안내한다.
const ORDER_PROGRESS = {
  preparing: {
    headline: 'Now in the Making',
    subject: (orderNumber) => `[CAGE3000] 주문하신 상품의 제작을 시작했습니다 — ${orderNumber}`,
    lead: '주문하신 상품의 제작을 시작했습니다. 한 점씩 손으로 만들어 영업일 기준 4–6일 안에 완성한 뒤 발송해 드릴게요.',
  },
  shipped: {
    headline: 'On Its Way',
    subject: (orderNumber) => `[CAGE3000] 주문하신 상품을 발송했습니다 — ${orderNumber}`,
    lead: '제작을 마친 상품을 발송했습니다. 아래 운송장 번호로 배송 상황을 확인하실 수 있어요.',
  },
};

export async function sendOrderProgressEmail({
  to,
  name,
  orderNumber,
  status, // 'preparing' | 'shipped'
  trackingCarrier,
  trackingNumber,
  isGuest,
}) {
  const copy = ORDER_PROGRESS[status];
  if (!copy || !to) return null;

  const greeting = name ? `${escapeHtml(name)}님,` : '안녕하세요,';
  const ctaUrl = `${SITE_URL}${isGuest ? '/order-lookup' : '/my-page'}`;
  const hasTracking = status === 'shipped' && trackingNumber;

  const trackingBlock = hasTracking
    ? `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;margin:0 0 24px 0;">
      <tr>
        <td style="padding:10px 0;font-size:12px;color:#71717a;width:90px;">택배사</td>
        <td style="padding:10px 0;font-size:13px;color:#27272a;">${escapeHtml(trackingCarrier || '-')}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;font-size:12px;color:#71717a;">운송장 번호</td>
        <td style="padding:10px 0;font-size:15px;color:#000;font-weight:600;letter-spacing:0.03em;">${escapeHtml(trackingNumber)}</td>
      </tr>
    </table>`
    : '';

  const body = `
    <p style="margin:0 0 20px 0;">${greeting}</p>
    <p style="margin:0 0 20px 0;">${copy.lead}</p>
    <p style="margin:0 0 24px 0;font-size:13px;color:#71717a;">주문번호 <strong style="color:#000;letter-spacing:0.05em;">${escapeHtml(orderNumber)}</strong></p>
    ${trackingBlock}
  `;

  const html = shellTemplate({
    headline: copy.headline,
    body,
    ctaLabel: 'View Order',
    ctaUrl,
    footnote: '주문 진행 상황이 바뀔 때 자동으로 발송되는 메일입니다. 문의는 이 메일에 회신해 주세요.',
  });

  const text = [
    name ? `${name}님,` : '안녕하세요,',
    '',
    copy.lead,
    `주문번호: ${orderNumber}`,
    ...(hasTracking ? [`택배사: ${trackingCarrier || '-'}`, `운송장 번호: ${trackingNumber}`] : []),
    '',
    `주문 확인: ${ctaUrl}`,
  ].join('\n');

  return sendEmail({ to, subject: copy.subject(orderNumber), html, text });
}
