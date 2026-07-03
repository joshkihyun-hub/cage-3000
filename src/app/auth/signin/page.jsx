'use client';

import { Suspense, useEffect, useState } from 'react';
import { getProviders, signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// NextAuth가 ?error=로 돌려보내는 코드 → 사용자 메시지.
const URL_ERROR_MESSAGES = {
  SUSPENDED: '정지된 계정입니다. 관리자에게 문의해 주세요.',
  WITHDRAWN: '탈퇴 처리된 계정입니다.',
  OAuthAccountNotLinked:
    '이미 다른 방법으로 가입된 이메일입니다. 이메일·비밀번호로 로그인해 주세요.',
  AccessDenied: '로그인이 거부되었습니다.',
  Default: '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.',
};

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const registered = searchParams.get('registered') === '1';
  const urlError = searchParams.get('error');
  const fromCheckout = callbackUrl === '/checkout';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);
  const { update } = useSession();

  // Google 버튼은 서버에 프로바이더가 실제로 설정된 경우에만 노출.
  useEffect(() => {
    getProviders().then((p) => setHasGoogle(Boolean(p?.google))).catch(() => {});
  }, []);

  useEffect(() => {
    if (registered) {
      setError('');
      return;
    }
    if (urlError) {
      setError(URL_ERROR_MESSAGES[urlError] || URL_ERROR_MESSAGES.Default);
    }
  }, [registered, urlError]);

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
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        <Block>
          <h1 className="text-base md:text-lg">Sign In</h1>
        </Block>

        {fromCheckout && (
          <Block className="mt-3">
            <p className="text-sm leading-relaxed">
              계정 없이 구매하실 수 있어요.{' '}
              <Link href="/checkout" className="underline hover:text-zinc-600">
                비회원으로 주문하기
              </Link>
            </p>
          </Block>
        )}

        {registered && (
          <Block className="mt-3">
            <p className="text-sm leading-relaxed">
              회원가입이 완료되었습니다. 인증 메일을 발송했으니 이메일을 확인해 주세요.
            </p>
          </Block>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          {error && (
            <Block>
              <p className="text-sm text-red-600">{error}</p>
            </Block>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block>
              <label className="block text-sm mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none"
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Block>

            <Block>
              <label className="block text-sm mb-2" htmlFor="password">
                Password
              </label>
              <input
                className="w-full border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none"
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Block>
          </div>

          <Block>
            <button
              type="submit"
              disabled={submitting}
              className="text-sm md:text-base hover:underline disabled:text-zinc-400 disabled:cursor-not-allowed"
            >
              {submitting ? '로그인 중…' : 'Submit →'}
            </button>
          </Block>

          {hasGoogle && (
            <Block>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl })}
                className="text-sm md:text-base hover:underline"
              >
                Continue with Google →
              </button>
            </Block>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Block>
              <Link href="/auth/forgot-password" className="text-sm hover:underline">
                Forgot Password
              </Link>
            </Block>
            <Block>
              <Link href="/auth/signup" className="text-sm hover:underline">
                Register
              </Link>
            </Block>
          </div>
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

export default function SignIn() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SignInForm />
    </Suspense>
  );
}
