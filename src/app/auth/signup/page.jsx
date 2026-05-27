'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DaumPostcode from 'react-daum-postcode';
import { Eye, EyeOff, Check } from 'lucide-react';
import {
  isValidEmail,
  isValidKrPhone,
  formatKrPhone,
  checkPasswordStrength,
  PASSWORD_MIN_LENGTH,
} from '@/lib/validation';

const inputClass =
  'w-full border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none';

const errorInputClass =
  'w-full border-b border-red-400 py-2 text-base focus:outline-none focus:border-red-600 transition-colors bg-transparent rounded-none';

const labelClass = 'block text-xs uppercase tracking-[0.2em] text-zinc-800 mb-2';

const strengthLabels = ['', '매우 약함', '약함', '보통', '강함', '매우 강함'];

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [touched, setTouched] = useState({});
  const [isPostcodeOpen, setIsPostcodeOpen] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const allAgreed = termsAgreed && privacyAgreed && marketingConsent;

  const strength = useMemo(() => checkPasswordStrength(password), [password]);

  const errors = useMemo(() => {
    const e = {};
    if (name && name.trim().length < 2) e.name = '이름은 2자 이상이어야 합니다.';
    if (email && !isValidEmail(email)) e.email = '올바른 이메일 형식이 아닙니다.';
    if (phoneNumber && !isValidKrPhone(phoneNumber)) {
      e.phoneNumber = '예) 010-1234-5678';
    }
    if (password && !strength.ok) e.password = strength.reasons[0];
    if (confirmPassword && confirmPassword !== password) {
      e.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }
    return e;
  }, [name, email, phoneNumber, password, confirmPassword, strength]);

  const blur = (field) => setTouched((t) => ({ ...t, [field]: true }));
  const shouldShow = (field) => touched[field] && errors[field];

  const handlePhoneChange = (value) => {
    setPhoneNumber(formatKrPhone(value));
  };

  const handleCompletePostcode = (data) => {
    setAddress(data.address);
    setZipCode(data.zonecode);
    setIsPostcodeOpen(false);
  };

  const toggleAll = () => {
    const next = !allAgreed;
    setTermsAgreed(next);
    setPrivacyAgreed(next);
    setMarketingConsent(next);
  };

  const formValid =
    name.trim().length >= 2 &&
    isValidEmail(email) &&
    isValidKrPhone(phoneNumber) &&
    strength.ok &&
    password === confirmPassword &&
    termsAgreed &&
    privacyAgreed;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!formValid) {
      setTouched({
        name: true,
        email: true,
        phoneNumber: true,
        password: true,
        confirmPassword: true,
      });
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phoneNumber,
          email: email.trim().toLowerCase(),
          address,
          detailAddress,
          zipCode,
          marketingConsent,
          termsAgreed,
          privacyAgreed,
          password,
        }),
      });

      if (response.ok) {
        router.push('/auth/signin?registered=1');
        return;
      }
      const data = await response.json().catch(() => ({}));
      setServerError(data.error || '회원가입 중 오류가 발생했습니다.');
    } catch {
      setServerError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-2xl">

        <div className="mb-16">
          <h1 className="text-xl md:text-2xl text-black mb-4 uppercase tracking-wide">
            Register Account
          </h1>
          <p className="text-sm text-zinc-500">
            이미 회원이신가요?{' '}
            <Link href="/auth/signin" className="text-black underline hover:text-zinc-600 transition-colors">
              로그인
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12" noValidate>
          {serverError && (
            <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 py-3">
              {serverError}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <label className={labelClass} htmlFor="name">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                className={shouldShow('name') ? errorInputClass : inputClass}
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => blur('name')}
              />
              {shouldShow('name') && (
                <p className="text-[11px] text-red-500 mt-2">{errors.name}</p>
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="phoneNumber">
                휴대폰 번호 <span className="text-red-500">*</span>
              </label>
              <input
                className={shouldShow('phoneNumber') ? errorInputClass : inputClass}
                id="phoneNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="010-1234-5678"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onBlur={() => blur('phoneNumber')}
                maxLength={13}
              />
              {shouldShow('phoneNumber') && (
                <p className="text-[11px] text-red-500 mt-2">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="email">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              className={shouldShow('email') ? errorInputClass : inputClass}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => blur('email')}
            />
            {shouldShow('email') && (
              <p className="text-[11px] text-red-500 mt-2">{errors.email}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>주소 (선택)</label>
            <div className="space-y-4">
              <div className="flex gap-4">
                <input
                  className="w-32 border-b border-zinc-200 py-2 text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
                  placeholder="우편번호"
                  value={zipCode}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsPostcodeOpen(true)}
                  className="bg-black text-white py-2 px-6 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
                >
                  검색
                </button>
              </div>
              <input
                className={inputClass}
                placeholder="기본 주소"
                value={address}
                readOnly
              />
              <input
                className={inputClass}
                placeholder="상세 주소 (동/호수 등)"
                value={detailAddress}
                onChange={(e) => setDetailAddress(e.target.value)}
              />
            </div>
            {isPostcodeOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-4 w-full max-w-md relative">
                  <button
                    type="button"
                    onClick={() => setIsPostcodeOpen(false)}
                    className="absolute top-2 right-2 p-2 hover:bg-zinc-100 rounded-full"
                  >
                    ✕
                  </button>
                  <DaumPostcode onComplete={handleCompletePostcode} className="h-[400px]" />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="password">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                className={shouldShow('password') ? errorInputClass : inputClass}
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => blur('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-black"
                aria-label="비밀번호 표시 전환"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1 bg-zinc-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength.score <= 1
                        ? 'bg-red-400'
                        : strength.score === 2
                        ? 'bg-orange-400'
                        : strength.score === 3
                        ? 'bg-yellow-400'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-zinc-500 w-20 text-right">
                  {strengthLabels[Math.max(1, strength.score)]}
                </p>
              </div>
            )}
            <p className="text-[11px] text-zinc-400 mt-2">
              최소 {PASSWORD_MIN_LENGTH}자 이상, 영문과 숫자를 포함해 주세요.
            </p>
            {shouldShow('password') && (
              <p className="text-[11px] text-red-500 mt-2">{errors.password}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="confirmPassword">
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                className={shouldShow('confirmPassword') ? errorInputClass : inputClass}
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => blur('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-black"
                aria-label="비밀번호 표시 전환"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {shouldShow('confirmPassword') && (
              <p className="text-[11px] text-red-500 mt-2">{errors.confirmPassword}</p>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="border-t border-zinc-100 pt-8 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allAgreed}
                onChange={toggleAll}
                className="w-4 h-4 accent-black"
              />
              <span className="text-xs uppercase tracking-[0.2em] text-black font-medium">
                전체 동의
              </span>
            </label>

            <div className="pl-7 space-y-3 border-l border-zinc-100">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-black"
                />
                <span className="text-xs text-zinc-700 leading-relaxed">
                  <span className="text-red-500 mr-1">[필수]</span>
                  <Link href="/terms" target="_blank" className="underline hover:text-black">
                    이용약관
                  </Link>
                  에 동의합니다.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={privacyAgreed}
                  onChange={(e) => setPrivacyAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-black"
                />
                <span className="text-xs text-zinc-700 leading-relaxed">
                  <span className="text-red-500 mr-1">[필수]</span>
                  <Link href="/privacy" target="_blank" className="underline hover:text-black">
                    개인정보 수집 및 이용
                  </Link>
                  에 동의합니다.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={marketingConsent}
                  onChange={(e) => setMarketingConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-black"
                />
                <span className="text-xs text-zinc-500 leading-relaxed">
                  <span className="text-zinc-400 mr-1">[선택]</span>
                  마케팅 정보 수신(이메일·SMS)에 동의합니다.
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting || !formValid}
              className="bg-black text-white py-4 px-16 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {submitting ? '처리 중...' : '회원가입'}
              {formValid && !submitting && <Check size={14} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
