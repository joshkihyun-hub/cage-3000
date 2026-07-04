'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isValidEmail } from '@/lib/validation';
import { Block } from '@/components/block';

const inputClass =
  'w-full border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('올바른 이메일을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubmitted(true);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        <Block>
          <h1 className="text-base md:text-lg">Forgot Password</h1>
          <p className="text-sm text-zinc-500 mt-1">
            가입하신 이메일을 입력하시면 재설정 링크를 보내드립니다.
          </p>
        </Block>

        {submitted ? (
          <>
            <Block className="mt-3">
              <p className="text-sm text-zinc-700">메일을 발송했습니다.</p>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                입력하신 주소로 가입된 계정이 있다면, 1시간 안에 사용 가능한 재설정 링크가 도착합니다.
                메일이 보이지 않으면 스팸함도 확인해 주세요.
              </p>
            </Block>
            <Block className="mt-3">
              <Link href="/auth/signin" className="text-sm md:text-base hover:underline">
                로그인 페이지로 →
              </Link>
            </Block>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 space-y-3">
            {error && (
              <Block>
                <p className="text-sm text-red-600">{error}</p>
              </Block>
            )}

            <Block>
              <label className="block text-sm mb-2" htmlFor="email">
                Email
              </label>
              <input
                className={inputClass}
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Block>

            <Block>
              <button
                type="submit"
                disabled={submitting}
                className="text-sm md:text-base hover:underline disabled:text-zinc-400 disabled:cursor-not-allowed"
              >
                {submitting ? '발송 중…' : '재설정 링크 발송 →'}
              </button>
            </Block>

            <Block>
              <Link href="/auth/signin" className="text-sm hover:underline">
                로그인으로 돌아가기
              </Link>
            </Block>
          </form>
        )}
      </div>
    </div>
  );
}
