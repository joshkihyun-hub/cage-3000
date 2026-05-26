'use client';

import { Suspense, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const registered = searchParams.get('registered') === '1';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { update } = useSession();

  useEffect(() => {
    if (registered) {
      // Surface a friendly notice after a successful registration redirect.
      setError('');
    }
  }, [registered]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (result?.error) {
        if (result.error === 'SUSPENDED') {
          setError('정지된 계정입니다. 관리자에게 문의해 주세요.');
        } else if (result.error === 'WITHDRAWN') {
          setError('탈퇴 처리된 계정입니다.');
        } else {
          setError('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
        return;
      }
      await update();
      router.push(callbackUrl);
    } catch {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-zinc-900 min-h-screen flex items-center justify-center pt-20">
      <div className="max-w-sm w-full p-8">
        <h1 className="font-serif text-3xl text-center mb-12 text-black uppercase">Login</h1>

        {registered && (
          <p className="text-emerald-700 text-center mb-6 text-xs bg-emerald-50 border border-emerald-100 py-3 leading-relaxed">
            회원가입이 완료되었습니다.<br />
            인증 메일을 발송했으니 이메일을 확인해 주세요.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-500 text-center mb-4 text-xs bg-red-50 border border-red-100 py-3">
              {error}
            </p>
          )}
          <div className="mb-8">
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
          <div className="mb-12">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-transparent rounded-none"
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col items-center space-y-6">
            <button
              disabled={submitting}
              className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:bg-zinc-300"
              type="submit"
            >
              {submitting ? '로그인 중...' : 'Sign In'}
            </button>
            <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-zinc-400">
              <Link
                href="/auth/forgot-password"
                className="hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5"
              >
                Forgot Password?
              </Link>
              <span className="text-zinc-200">·</span>
              <Link
                href="/auth/signup"
                className="hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5"
              >
                Register
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignInForm />
    </Suspense>
  );
}
