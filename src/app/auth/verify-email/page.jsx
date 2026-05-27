'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-10">CAGE3000</p>

        {state.status === 'loading' && (
          <>
            <h1 className="text-2xl mb-4">이메일을 인증하는 중...</h1>
            <p className="text-sm text-zinc-500">잠시만 기다려 주세요.</p>
          </>
        )}

        {state.status === 'success' && (
          <>
            <h1 className="text-3xl mb-4 text-black">Verified</h1>
            <p className="text-sm text-zinc-600 mb-12">{state.message}</p>
            <Link
              href="/auth/signin"
              className="inline-block bg-black text-white px-10 py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors"
            >
              로그인하기
            </Link>
          </>
        )}

        {state.status === 'error' && (
          <>
            <h1 className="text-3xl mb-4 text-black">Verification Failed</h1>
            <p className="text-sm text-red-500 mb-12">{state.message}</p>
            <Link
              href="/auth/signin"
              className="inline-block border border-zinc-200 text-zinc-700 px-10 py-4 text-xs uppercase tracking-[0.2em] hover:border-black hover:text-black transition-colors"
            >
              로그인 페이지로
            </Link>
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
