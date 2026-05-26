'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isValidEmail } from '@/lib/validation';

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
    <div className="bg-white text-zinc-900 min-h-screen flex items-center justify-center pt-20">
      <div className="max-w-sm w-full p-8">
        <h1 className="font-serif text-3xl text-center mb-4 text-black uppercase">
          Forgot Password
        </h1>
        <p className="text-xs text-zinc-500 text-center mb-12 leading-relaxed">
          가입하신 이메일을 입력하시면<br />재설정 링크를 보내드립니다.
        </p>

        {submitted ? (
          <div className="text-center">
            <p className="text-sm text-zinc-700 mb-3">
              메일을 발송했습니다.
            </p>
            <p className="text-xs text-zinc-400 leading-relaxed mb-10">
              입력하신 주소로 가입된 계정이 있다면, 1시간 안에 사용 가능한 재설정 링크가 도착합니다.
              메일이 보이지 않으면 스팸함도 확인해 주세요.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black border-b border-transparent hover:border-black pb-0.5"
            >
              로그인 페이지로
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <p className="text-red-500 text-center mb-4 text-xs bg-red-50 border border-red-100 py-3">
                {error}
              </p>
            )}
            <div className="mb-12">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:bg-zinc-300"
            >
              {submitting ? '발송 중...' : 'Send Reset Link'}
            </button>
            <div className="mt-8 text-center">
              <Link
                href="/auth/signin"
                className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-black border-b border-transparent hover:border-black pb-0.5"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
