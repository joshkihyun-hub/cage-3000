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

export async function sendEmail({ to, subject, html, text }) {
  const client = getClient();
  const payload = {
    from: FROM,
    to,
    subject,
    html,
    text,
  };
  if (REPLY_TO) payload.reply_to = REPLY_TO;
  return client.emails.send(payload);
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
  const html = shellTemplate({
    headline: 'Verify your email',
    body: `
      <p style="margin:0 0 16px 0;">${name ? `${name}님, ` : ''}CAGE3000에 가입해 주셔서 감사합니다.</p>
      <p style="margin:0 0 16px 0;">아래 버튼을 눌러 이메일 주소를 인증해 주세요. 이 링크는 <strong>24시간</strong> 동안 유효합니다.</p>
    `,
    ctaLabel: 'Verify Email',
    ctaUrl: url,
    footnote: '본인이 가입하지 않았다면 이 메일은 무시해 주세요. 계정이 활성화되지 않습니다.',
  });
  return sendEmail({
    to,
    subject: '[CAGE3000] 이메일 인증을 완료해 주세요',
    html,
    text: `이메일 인증 링크: ${url}\n링크는 24시간 동안 유효합니다.`,
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
