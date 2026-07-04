'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { checkPasswordStrength, PASSWORD_MIN_LENGTH } from '@/lib/validation';
import { Block } from '@/components/block';

const strengthLabels = ['', '매우 약함', '약함', '보통', '강함', '매우 강함'];

const inputClass =
  'w-full border-b border-zinc-900 py-1 text-sm md:text-base focus:outline-none bg-transparent rounded-none';

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
      <PageShell>
        <Block>
          <h1 className="text-base md:text-lg">Invalid Link</h1>
          <p className="text-sm text-zinc-700 mt-1">재설정 토큰이 없습니다.</p>
        </Block>
        <Block className="mt-3">
          <Link href="/auth/forgot-password" className="text-sm md:text-base hover:underline">
            재설정 다시 요청 →
          </Link>
        </Block>
      </PageShell>
    );
  }

  if (success) {
    return (
      <PageShell>
        <Block>
          <h1 className="text-base md:text-lg">Password Updated</h1>
          <p className="text-sm text-zinc-700 mt-1">새 비밀번호로 로그인해 주세요.</p>
        </Block>
        <Block className="mt-3">
          <Link href="/auth/signin" className="text-sm md:text-base hover:underline">
            로그인하기 →
          </Link>
        </Block>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Block>
        <h1 className="text-base md:text-lg">Reset Password</h1>
      </Block>

      <form onSubmit={handleSubmit} className="mt-3 space-y-3">
        {error && (
          <Block>
            <p className="text-sm text-red-600">{error}</p>
          </Block>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Block>
            <label className="block text-sm mb-2" htmlFor="new-password">
              New Password
            </label>
            <div className="relative">
              <input
                id="new-password"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-black"
                aria-label="비밀번호 표시 전환"
              >
                {show ? <EyeOff size={14} /> : <Eye size={14} />}
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
          </Block>

          <Block>
            <label className="block text-sm mb-2" htmlFor="confirm-password">
              Confirm
            </label>
            <input
              id="confirm-password"
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
            {confirm && password !== confirm && (
              <p className="text-xs text-red-600 mt-2">비밀번호가 일치하지 않습니다.</p>
            )}
          </Block>
        </div>

        <Block>
          <button
            type="submit"
            disabled={!formValid || submitting}
            className="text-sm md:text-base hover:underline disabled:text-zinc-400 disabled:cursor-not-allowed"
          >
            {submitting ? '재설정 중…' : '비밀번호 변경 →'}
          </button>
        </Block>
      </form>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="bg-white text-zinc-900 min-h-screen pt-32 md:pt-40 pb-24 font-sans">
      <div className="container mx-auto px-6 md:px-12 max-w-screen-md">{children}</div>
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
