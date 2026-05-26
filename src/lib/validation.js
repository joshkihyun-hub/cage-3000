export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 한국 휴대폰: 010/011/016/017/018/019 + 7~8자리. 하이픈 있어도/없어도 허용.
export const KR_PHONE_REGEX = /^01[016789]-?\d{3,4}-?\d{4}$/;

export const PASSWORD_MIN_LENGTH = 8;

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_REGEX.test(value.trim());
}

export function normalizePhone(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/[^\d]/g, '');
}

export function formatKrPhone(value) {
  const digits = normalizePhone(value).slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export function isValidKrPhone(value) {
  if (typeof value !== 'string') return false;
  return KR_PHONE_REGEX.test(value.trim());
}

export function checkPasswordStrength(password) {
  if (typeof password !== 'string') {
    return { score: 0, ok: false, reasons: ['비밀번호를 입력해 주세요.'] };
  }
  const reasons = [];
  if (password.length < PASSWORD_MIN_LENGTH) {
    reasons.push(`최소 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`);
  }
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (!hasLetter) reasons.push('영문을 포함해야 합니다.');
  if (!hasNumber) reasons.push('숫자를 포함해야 합니다.');

  let score = 0;
  if (password.length >= PASSWORD_MIN_LENGTH) score += 1;
  if (password.length >= 12) score += 1;
  if (hasLetter && hasNumber) score += 1;
  if (hasSymbol) score += 1;

  return { score, ok: reasons.length === 0, reasons, hasSymbol };
}
