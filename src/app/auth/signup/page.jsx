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
  'w-full border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none';

const errorInputClass =
  'w-full border-b border-red-500 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none';

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
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        <Block>
          <h1 className="text-base md:text-lg">Register Account</h1>
        </Block>

        <Block className="mt-3">
          <p className="text-sm text-zinc-700">
            이미 회원이신가요?{' '}
            <Link href="/auth/signin" className="underline hover:text-zinc-500">
              로그인
            </Link>
          </p>
        </Block>

        <form onSubmit={handleSubmit} className="mt-3 space-y-3" noValidate>
          {serverError && (
            <Block>
              <p className="text-sm text-red-600">{serverError}</p>
            </Block>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block>
              <Label htmlFor="name" required>Name</Label>
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
            </Block>

            <Block>
              <Label htmlFor="phoneNumber" required>Phone</Label>
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
            </Block>
          </div>

          <Block>
            <Label htmlFor="email" required>Email</Label>
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
          </Block>

          <Block>
            <Label optional>Address</Label>
            <div className="space-y-3">
              <div className="flex gap-3 items-center">
                <input
                  className="w-32 border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none"
                  placeholder="우편번호"
                  value={zipCode}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsPostcodeOpen(true)}
                  className="text-sm hover:underline"
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
          </Block>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block>
              <Label htmlFor="password" required>Password</Label>
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
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-black"
                  aria-label="비밀번호 표시 전환"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {password && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-px bg-zinc-200 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength.score <= 1
                          ? 'bg-red-500'
                          : strength.score === 2
                          ? 'bg-orange-500'
                          : strength.score === 3
                          ? 'bg-yellow-500'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${(strength.score / 4) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-600 w-16 text-right">
                    {strengthLabels[Math.max(1, strength.score)]}
                  </p>
                </div>
              )}
              <p className="text-xs text-zinc-500 mt-2">
                최소 {PASSWORD_MIN_LENGTH}자, 영문·숫자 포함
              </p>
              {shouldShow('password') && <ErrorText>{errors.password}</ErrorText>}
            </Block>

            <Block>
              <Label htmlFor="confirmPassword" required>Confirm</Label>
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
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-black"
                  aria-label="비밀번호 표시 전환"
                >
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {shouldShow('confirmPassword') && <ErrorText>{errors.confirmPassword}</ErrorText>}
            </Block>
          </div>

          <Block>
            <Label>Consent</Label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allAgreed}
                  onChange={toggleAll}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-sm">전체 동의</span>
              </label>

              <div className="pl-6 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-black"
                  />
                  <span className="text-sm text-zinc-700 leading-relaxed">
                    <span className="text-red-600 mr-1">*</span>
                    <Link href="/terms" target="_blank" className="underline hover:text-black">
                      이용약관
                    </Link>
                    에 동의합니다.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-black"
                  />
                  <span className="text-sm text-zinc-700 leading-relaxed">
                    <span className="text-red-600 mr-1">*</span>
                    <Link href="/privacy" target="_blank" className="underline hover:text-black">
                      개인정보 수집 및 이용
                    </Link>
                    에 동의합니다.
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(e) => setMarketingConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-black"
                  />
                  <span className="text-sm text-zinc-500 leading-relaxed">
                    마케팅 정보 수신(이메일·SMS)에 동의합니다.
                  </span>
                </label>
              </div>
            </div>
          </Block>

          <Block>
            <button
              type="submit"
              disabled={submitting || !formValid}
              className="text-sm md:text-base hover:underline disabled:text-zinc-400 disabled:cursor-not-allowed"
            >
              {submitting ? '처리 중…' : '회원가입 →'}
            </button>
          </Block>
        </form>
      </div>
    </div>
  );
}

function Block({ children, className = '' }) {
  return (
    <section className={`border-t border-l border-zinc-900 pt-2 pl-3 pb-4 ${className}`}>
      {children}
    </section>
  );
}

function Label({ htmlFor, required, optional, children }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm mb-2">
      {children}
      {required && <span className="text-red-600 ml-1">*</span>}
      {optional && <span className="text-zinc-500 ml-1 text-xs">선택</span>}
    </label>
  );
}

function ErrorText({ children }) {
  return <p className="text-xs text-red-600 mt-2">{children}</p>;
}
