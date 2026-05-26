'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { checkPasswordStrength, PASSWORD_MIN_LENGTH } from '@/lib/validation';

const strengthLabels = ['', '매우 약함', '약함', '보통', '강함', '매우 강함'];

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => checkPasswordStrength(password), [password]);

  const formValid =
    !!token && strength.ok && password === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('재설정 토큰이 없습니다.');
      return;
    }
    if (!strength.ok) {
      setError(strength.reasons[0]);
      return;
    }
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(json.error || '재설정에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <h1 className="font-serif text-3xl mb-4 text-black">Invalid Link</h1>
          <p className="text-sm text-zinc-500 mb-12">재설정 토큰이 없습니다.</p>
          <Link
            href="/auth/forgot-password"
            className="inline-block bg-black text-white px-10 py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800"
          >
            재설정 다시 요청
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 mb-10">CAGE3000</p>
          <h1 className="font-serif text-3xl mb-4 text-black">Password Updated</h1>
          <p className="text-sm text-zinc-600 mb-12">
            새 비밀번호로 로그인해 주세요.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-black text-white px-10 py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-zinc-900 min-h-screen flex items-center justify-center pt-20">
      <div className="max-w-sm w-full p-8">
        <h1 className="font-serif text-3xl text-center mb-12 text-black uppercase">
          Reset Password
        </h1>
        <form onSubmit={handleSubmit}>
          {error && (
            <p className="text-red-500 text-center mb-4 text-xs bg-red-50 border border-red-100 py-3">
              {error}
            </p>
          )}

          <div className="mb-6">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black bg-transparent rounded-none"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-black"
                aria-label="비밀번호 표시 전환"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
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
              최소 {PASSWORD_MIN_LENGTH}자, 영문+숫자 포함.
            </p>
          </div>

          <div className="mb-12">
            <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">
              Confirm Password
            </label>
            <input
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black bg-transparent rounded-none"
            />
            {confirm && password !== confirm && (
              <p className="text-[11px] text-red-500 mt-2">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!formValid || submitting}
            className="w-full bg-black text-white py-4 text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors disabled:bg-zinc-300 disabled:cursor-not-allowed"
          >
            {submitting ? '재설정 중...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
