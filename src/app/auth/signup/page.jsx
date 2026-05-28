'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DaumPostcode from 'react-daum-postcode';
import { Eye, EyeOff } from 'lucide-react';
import {
  isValidEmail,
  isValidKrPhone,
  formatKrPhone,
  checkPasswordStrength,
  PASSWORD_MIN_LENGTH,
} from '@/lib/validation';

const inputClass =
  'w-full border-b border-zinc-300 py-2 text-sm md:text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none';

const errorInputClass =
  'w-full border-b border-red-400 py-2 text-sm md:text-base focus:outline-none focus:border-red-600 transition-colors bg-transparent rounded-none';

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
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-lg">

        {/* Editorial Header Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 mb-16 md:mb-20 text-xs md:text-sm text-zinc-900 leading-relaxed">
          <p>(CAGE3000)</p>
          <p className="md:text-right">(Register)</p>
          <p>(Seoul)</p>
          <p className="md:text-right">(About)</p>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl mb-3 tracking-tight">(Register Account)</h1>
        <p className="text-sm md:text-base text-zinc-500 mb-14 md:mb-16">
          이미 회원이신가요?{' '}
          <Link href="/auth/signin" className="text-blue-600 hover:text-black transition-colors">
            (로그인)
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-0 border-t border-zinc-900/90" noValidate>
          {serverError && (
            <p className="text-red-500 text-xs md:text-sm py-3 border-b border-red-100">
              ({serverError})
            </p>
          )}

          {/* Name */}
          <FormRow label="(Name)" required>
            <input
              className={shouldShow('name') ? errorInputClass : inputClass}
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => blur('name')}
            />
            {shouldShow('name') && <ErrorText>{errors.name}</ErrorText>}
          </FormRow>

          {/* Phone */}
          <FormRow label="(Phone)" required>
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
            {shouldShow('phoneNumber') && <ErrorText>{errors.phoneNumber}</ErrorText>}
          </FormRow>

          {/* Email */}
          <FormRow label="(Email)" required>
            <input
              className={shouldShow('email') ? errorInputClass : inputClass}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => blur('email')}
            />
            {shouldShow('email') && <ErrorText>{errors.email}</ErrorText>}
          </FormRow>

          {/* Address */}
          <FormRow label="(Address)" optional>
            <div className="space-y-4">
              <div className="flex gap-3 items-end">
                <input
                  className="w-32 border-b border-zinc-300 py-2 text-sm md:text-base focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
                  placeholder="우편번호"
                  value={zipCode}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsPostcodeOpen(true)}
                  className="text-sm md:text-base text-blue-600 hover:text-black transition-colors pb-2"
                >
                  (검색)
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
          </FormRow>

          {/* Password */}
          <FormRow label="(Password)" required>
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
                  ({strengthLabels[Math.max(1, strength.score)]})
                </p>
              </div>
            )}
            <p className="text-[11px] md:text-xs text-zinc-400 mt-2">
              최소 {PASSWORD_MIN_LENGTH}자 이상, 영문과 숫자를 포함해 주세요.
            </p>
            {shouldShow('password') && <ErrorText>{errors.password}</ErrorText>}
          </FormRow>

          {/* Confirm Password */}
          <FormRow label="(Confirm)" required>
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
            {shouldShow('confirmPassword') && <ErrorText>{errors.confirmPassword}</ErrorText>}
          </FormRow>

          {/* Consent */}
          <FormRow label="(Consent)" required>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={toggleAll}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm md:text-base text-zinc-900">
                  (전체 동의)
                </span>
              </label>

              <div className="pl-7 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-black"
                  />
                  <span className="text-xs md:text-sm text-zinc-600 leading-relaxed">
                    <span className="bg-pink-100 px-1 py-0.5 mr-1 text-zinc-900">필수</span>
                    <Link href="/terms" target="_blank" className="text-blue-600 hover:text-black">
                      (이용약관)
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
                  <span className="text-xs md:text-sm text-zinc-600 leading-relaxed">
                    <span className="bg-pink-100 px-1 py-0.5 mr-1 text-zinc-900">필수</span>
                    <Link href="/privacy" target="_blank" className="text-blue-600 hover:text-black">
                      (개인정보 수집 및 이용)
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
                  <span className="text-xs md:text-sm text-zinc-500 leading-relaxed">
                    <span className="bg-zinc-100 px-1 py-0.5 mr-1 text-zinc-500">선택</span>
                    마케팅 정보 수신(이메일·SMS)에 동의합니다.
                  </span>
                </label>
              </div>
            </div>
          </FormRow>

          {/* Submit — editorial link-style */}
          <div className="flex justify-end pt-10">
            <button
              type="submit"
              disabled={submitting || !formValid}
              className="text-lg md:text-xl text-blue-600 hover:text-black transition-colors disabled:text-zinc-300 disabled:cursor-not-allowed"
            >
              {submitting ? '(처리 중…)' : '(회원가입) →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormRow({ label, required, optional, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-10 py-6 border-b border-zinc-100 items-start">
      <p className="text-sm md:text-base text-zinc-500 pt-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {optional && <span className="text-zinc-400 ml-1 text-xs">(선택)</span>}
      </p>
      <div>{children}</div>
    </div>
  );
}

function ErrorText({ children }) {
  return <p className="text-[11px] md:text-xs text-red-500 mt-2">({children})</p>;
}
