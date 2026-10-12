'use client';

import Link from 'next/link';
import { useState } from 'react';

// 작업 소식(Field Notes) 구독. 늘 떠 있지 않고 About의 "031 / 3000"에만 숨어 있다 —
// 숫자를 누르면 다음 번호를 먼저 받는 칸이 열린다.
// 이메일을 남기면 작업 스케치와 아직 공개 전인 작업을 먼저 받아 본다.
// 광고성 정보라 수신 동의 체크가 있어야 보낼 수 있다.

const WALL = 'bg-[#e1e1e4]'; // QUARTERS 룩북 촬영장의 벽색

function FieldNotesForm({ id, doneText, onFocusChange }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [message, setMessage] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (state === 'sending') return;
    if (!consent) {
      setState('error');
      setMessage('수신 동의에 체크해 주세요.');
      return;
    }
    setState('sending');
    setMessage('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, website: e.currentTarget.website?.value || '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '잠시 후 다시 시도해 주세요.');
      setState('done');
    } catch (err) {
      setState('error');
      setMessage(err.message);
    }
  };

  if (state === 'done') {
    return (
      <p className="text-[12px] text-zinc-800" role="status">
        {doneText}
      </p>
    );
  }

  return (
    <form
      onSubmit={submit}
      onFocus={() => onFocusChange?.(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) onFocusChange?.(false);
      }}
      className="w-full md:max-w-sm"
      noValidate
    >
      <div className="flex items-end gap-4 border-b border-zinc-900">
        <label htmlFor={id} className="sr-only">이메일</label>
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] text-black placeholder:text-zinc-500 outline-none"
        />
        {/* 봇만 채우는 숨은 칸 */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="shrink-0 py-1.5 text-[13px] font-medium text-black hover:underline underline-offset-2 disabled:text-zinc-400"
        >
          {state === 'sending' ? 'Sending…' : 'Subscribe →'}
        </button>
      </div>
      <label className="mt-2.5 flex items-start gap-2 text-[10px] leading-[1.5] text-zinc-500 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-[2px] h-3 w-3 shrink-0 accent-black"
        />
        <span>
          (필수) 작업 소식·신작 안내 메일 수신과 이메일 수집·이용에 동의합니다. 메일 하단에서 언제든 해지할 수 있어요.{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-black">개인정보처리방침</Link>
        </span>
      </label>
      {state === 'error' && message && (
        <p className="mt-2 text-[11px] text-red-600" role="alert">{message}</p>
      )}
    </form>
  );
}

// 숫자에 숨기기 — About의 "031 / 3000". 겉보기엔 그냥 숫자다. 올리면(누르면) 밑줄이
// 비치고, 누르면 그 아래로 다음 번호를 먼저 받는 칸이 열린다.
export function FieldNotesNumber({ made, total, children }) {
  const [open, setOpen] = useState(false);
  const next = String(made + 1).padStart(3, '0');
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="tabular-nums text-left underline-offset-2 decoration-1 hover:underline"
      >
        {String(made).padStart(3, '0')} / {total}
      </button>
      {children}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className={`${WALL} mt-3 px-4 py-4`}>
            <p className="mb-3 text-zinc-600">Receive No.&nbsp;{next} before anyone else.</p>
            <FieldNotesForm id="field-notes-number-email" doneText={`You will see No. ${next} first.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
