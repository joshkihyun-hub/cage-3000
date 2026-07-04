'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Block } from '@/components/block';

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState({ status: 'loading', message: '' });

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', message: '인증 토큰이 없습니다.' });
      return;
    }
    let cancelled = false;
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (cancelled) return;
        if (res.ok) {
          setState({
            status: 'success',
            message:
              json.status === 'already_verified'
                ? '이미 인증된 이메일입니다.'
                : '이메일 인증이 완료되었습니다.',
          });
        } else {
          setState({ status: 'error', message: json.error || '인증에 실패했습니다.' });
        }
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', message: '네트워크 오류가 발생했습니다.' });
      });
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">

        {state.status === 'loading' && (
          <Block>
            <h1 className="text-base md:text-lg">이메일을 인증하는 중…</h1>
            <p className="text-sm text-zinc-500 mt-1">잠시만 기다려 주세요.</p>
          </Block>
        )}

        {state.status === 'success' && (
          <>
            <Block>
              <h1 className="text-base md:text-lg">Verified</h1>
              <p className="text-sm text-zinc-700 mt-1">{state.message}</p>
            </Block>
            <Block className="mt-3">
              <Link href="/auth/signin" className="text-sm md:text-base hover:underline">
                로그인하기 →
              </Link>
            </Block>
          </>
        )}

        {state.status === 'error' && (
          <>
            <Block>
              <h1 className="text-base md:text-lg">Verification Failed</h1>
              <p className="text-sm text-red-600 mt-1">{state.message}</p>
            </Block>
            <Block className="mt-3">
              <Link href="/auth/signin" className="text-sm md:text-base hover:underline">
                로그인 페이지로 →
              </Link>
            </Block>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <VerifyEmailInner />
    </Suspense>
  );
}
