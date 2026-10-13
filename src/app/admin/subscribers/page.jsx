'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '@/components/page-container';

const fmt = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '-'
    : d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

// Field Notes 구독자 — About의 숫자에서 신청한 이메일(DB에 바로 저장된 것)을 본다.
export default function AdminSubscribers() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/subscribers');
      return;
    }
    if (session?.user?.role !== 'admin') router.push('/');
  }, [authStatus, session, router]);

  useEffect(() => {
    if (session?.user?.role !== 'admin') return;
    let cancelled = false;
    fetch('/api/admin/subscribers')
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || '목록을 불러오지 못했어요.');
        return json.subscribers;
      })
      .then((rows) => { if (!cancelled) setList(rows); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [session]);

  const shown = useMemo(() => {
    if (!list) return [];
    const k = q.trim().toLowerCase();
    return k ? list.filter((s) => s.email.toLowerCase().includes(k)) : list;
  }, [list, q]);
  const active = list ? list.filter((s) => !s.unsubscribed).length : 0;

  if (authStatus === 'loading' || (authStatus === 'authenticated' && session?.user?.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm uppercase tracking-widest">Loading...</p>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="min-h-screen bg-white text-zinc-900 pt-32 pb-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <Link href="/admin" className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 hover:text-black">← Dashboard</Link>
              <h1 className="text-3xl uppercase mt-3">Field Notes</h1>
              <p className="text-xs text-zinc-400 mt-2 tracking-wide">
                {list ? `구독 중 ${active}명 · 해지 ${list.length - active}명` : '작업 소식 구독자'}
              </p>
            </div>
            <a
              href="/api/admin/subscribers?format=csv"
              className="text-[11px] uppercase tracking-[0.2em] px-5 py-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-colors"
            >
              Export CSV
            </a>
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="이메일 검색"
            className="w-full md:w-80 border-b border-zinc-300 focus:border-black outline-none py-2 text-sm mb-6"
          />

          {error && <p className="text-sm text-rose-500">{error}</p>}
          {!error && !list && <p className="text-sm text-zinc-400">불러오는 중…</p>}
          {list && shown.length === 0 && <p className="text-sm text-zinc-400">아직 구독자가 없어요.</p>}

          {shown.length > 0 && (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-[11px] uppercase tracking-[0.15em] text-zinc-400">
                  <th className="py-3 pr-4 font-normal">Email</th>
                  <th className="py-3 pr-4 font-normal">신청일</th>
                  <th className="py-3 font-normal">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {shown.map((s) => (
                  <tr key={s.email}>
                    <td className="py-3 pr-4 break-all">{s.email}</td>
                    <td className="py-3 pr-4 text-zinc-500 tabular-nums whitespace-nowrap">{fmt(s.createdAt)}</td>
                    <td className={`py-3 ${s.unsubscribed ? 'text-zinc-400' : 'text-zinc-900'}`}>
                      {s.unsubscribed ? '해지' : '구독 중'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
