'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';

const EMPTY = { name: '', email: '', organization: '', message: '', consent: false, website: '' };

const labelClass = 'block text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-zinc-500';
// 16px 미만이면 iOS가 입력 시 화면을 확대한다 — 모바일은 16px로.
const fieldClass =
    'mt-1.5 w-full bg-transparent border-0 border-b border-zinc-300 rounded-none px-0 py-2 text-[16px] md:text-[14px] text-black placeholder:text-zinc-300 focus:outline-none focus:border-black transition-colors';

// 제작 문의 — 트리거를 누르면 조용한 양식이 뜨고, 보내면 운영자 메일함으로 간다.
// className은 모달 본문에 붙는다(포털로 body에 그려지므로 페이지 폰트를 넘겨받을 때 쓴다).
export default function CommissionInquiry({ triggerClassName, className = '', children }) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [status, setStatus] = useState('idle'); // idle | sending | sent
    const [error, setError] = useState('');

    const set = (key) => (e) =>
        setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const onOpenChange = (next) => {
        setOpen(next);
        // 보낸 뒤 닫으면 다음에 열 때 빈 양식으로.
        if (!next && status === 'sent') {
            setForm(EMPTY);
            setStatus('idle');
        }
        if (!next) setError('');
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (status === 'sending') return;
        setStatus('sending');
        setError('');
        try {
            const res = await fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || '전송에 실패했어요. 잠시 후 다시 시도해 주세요.');
            setStatus('sent');
        } catch (err) {
            setError(err.message);
            setStatus('idle');
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Trigger asChild>
                <button type="button" className={triggerClassName}>{children}</button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-white/75 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-300" />
                <Dialog.Content
                    className={`${className} fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-[440px] max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white border border-black/10 p-6 md:p-8 text-black focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-300`}
                >
                    <div className="flex items-start justify-between gap-6">
                        <Dialog.Title className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.08em]">
                            Commission inquiry
                        </Dialog.Title>
                        <Dialog.Close className="text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-zinc-400 hover:text-black transition-colors">
                            Close
                        </Dialog.Close>
                    </div>

                    {status === 'sent' ? (
                        <div className="pt-10 pb-4">
                            <p className="text-[22px] md:text-[26px] font-medium leading-tight tracking-[-0.01em]">Thank you.</p>
                            <p className="mt-3 text-[13px] leading-relaxed text-zinc-600 break-keep">
                                보내주신 내용을 확인한 뒤 {form.email}로 회신드릴게요.
                            </p>
                            <Dialog.Close className="mt-10 text-[10px] md:text-[11px] uppercase tracking-[0.08em] text-zinc-400 hover:text-black transition-colors">
                                Close →
                            </Dialog.Close>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="pt-4">
                            <Dialog.Description className="text-[13px] leading-relaxed text-zinc-600 break-keep">
                                아티스트·작품을 위한 커스텀 메이드 의상 제작을 문의해 주세요. 일정이나 참고 자료 링크가 있다면 함께 적어 주시면 좋아요.
                            </Dialog.Description>

                            <div className="mt-7 space-y-6">
                                <label className="block">
                                    <span className={labelClass}>Name</span>
                                    <input required maxLength={100} autoComplete="name" value={form.name} onChange={set('name')} className={fieldClass} />
                                </label>
                                <label className="block">
                                    <span className={labelClass}>Email</span>
                                    <input required type="email" maxLength={200} autoComplete="email" value={form.email} onChange={set('email')} className={fieldClass} />
                                </label>
                                <label className="block">
                                    <span className={labelClass}>Artist / Project <span className="text-zinc-300">— optional</span></span>
                                    <input maxLength={200} autoComplete="organization" value={form.organization} onChange={set('organization')} className={fieldClass} />
                                </label>
                                <label className="block">
                                    <span className={labelClass}>Message</span>
                                    <textarea required minLength={5} maxLength={5000} rows={5} value={form.message} onChange={set('message')} className={`${fieldClass} resize-none leading-relaxed`} />
                                </label>

                                {/* 사람에겐 보이지 않는 칸 — 봇이 채우면 서버가 조용히 버린다. */}
                                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={set('website')} className="absolute left-0 top-0 w-px h-px overflow-hidden opacity-0 pointer-events-none" />

                                <label className="flex items-start gap-2.5 cursor-pointer">
                                    <input required type="checkbox" checked={form.consent} onChange={set('consent')} className="mt-[3px] w-3.5 h-3.5 shrink-0 accent-black" />
                                    <span className="text-[11px] leading-relaxed text-zinc-500 break-keep">
                                        문의 답변을 위해 이름과 이메일을 수집·이용하는 데 동의합니다.{' '}
                                        <Link href="/privacy" className="underline underline-offset-2 hover:text-black" onClick={() => setOpen(false)}>
                                            개인정보처리방침
                                        </Link>
                                    </span>
                                </label>
                            </div>

                            {error && <p role="alert" className="mt-5 text-[12px] text-red-600">{error}</p>}

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="mt-8 w-full bg-black text-white py-3.5 text-[11px] uppercase tracking-[0.12em] hover:bg-zinc-800 disabled:bg-zinc-400 transition-colors"
                            >
                                {status === 'sending' ? 'Sending…' : 'Send'}
                            </button>
                        </form>
                    )}
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
