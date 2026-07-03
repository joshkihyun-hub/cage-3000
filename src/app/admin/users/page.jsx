'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/components/page-container';
import UserDetailDrawer from './user-detail-drawer';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

const MARKETING_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Opted-in' },
  { value: 'false', label: 'Opted-out' },
];

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '-';
  }
}

function StatusBadge({ status }) {
  const styles = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    suspended: 'bg-amber-50 text-amber-700 border-amber-100',
    withdrawn: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  }[status] || 'bg-zinc-50 text-zinc-500 border-zinc-100';
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-widest border ${styles}`}>
      {status}
    </span>
  );
}

export default function AdminUsersPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();

  const [q, setQ] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [role, setRole] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [marketing, setMarketing] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [data, setData] = useState({ users: [], pagination: null, summary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  // Auth gate
  useEffect(() => {
    if (authStatus === 'loading') return;
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin/users');
      return;
    }
    if (session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [authStatus, session, router]);

  const buildQuery = useCallback(() => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (role) sp.set('role', role);
    if (statusFilter) sp.set('status', statusFilter);
    if (marketing) sp.set('marketing', marketing);
    sp.set('page', String(page));
    sp.set('pageSize', String(pageSize));
    return sp.toString();
  }, [q, role, statusFilter, marketing, page, pageSize]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/users?${buildQuery()}`);
      if (!res.ok) throw new Error('Failed to load users');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchUsers();
    }
  }, [session, fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setQ(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput('');
    setQ('');
    setRole('');
    setStatusFilter('');
    setMarketing('');
    setPage(1);
  };

  const onUserUpdated = (updated) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.map((u) =>
        u.id === updated.id ? { ...u, ...updated } : u
      ),
    }));
  };

  const summary = data.summary;

  const summaryCards = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Total', value: summary.total ?? 0 },
      { label: 'Active', value: summary.byStatus?.active ?? 0 },
      { label: 'Suspended', value: summary.byStatus?.suspended ?? 0 },
      { label: 'Withdrawn', value: summary.byStatus?.withdrawn ?? 0 },
    ];
  }, [summary]);

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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl uppercase">User Management</h1>
              <p className="text-xs text-zinc-400 mt-2 tracking-wide">
                회원 검색·필터·상태 변경·주문 이력 관리
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/admin" className="text-[11px] uppercase tracking-[0.2em] px-5 py-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-colors">
                Dashboard
              </a>
              <a href="/admin/orders" className="text-[11px] uppercase tracking-[0.2em] px-5 py-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-colors">
                Orders
              </a>
              {/* API 파일 다운로드는 <Link>가 아닌 일반 앵커가 맞다. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/api/admin/users/export"
                className="text-[11px] uppercase tracking-[0.2em] px-5 py-3 border border-zinc-200 hover:border-black hover:bg-black hover:text-white transition-colors"
              >
                Export CSV
              </a>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {summaryCards.map((card) => (
              <div key={card.label} className="border border-zinc-100 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">
                  {card.label}
                </p>
                <p className="text-2xl text-black">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <form
            onSubmit={handleSearch}
            className="flex flex-wrap gap-3 mb-8 items-end border-y border-zinc-100 py-5"
          >
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">
                Search
              </label>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="이름 / 이메일 / 휴대폰"
                className="w-full border-b border-zinc-200 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <Select label="Role" value={role} options={ROLE_OPTIONS} onChange={(v) => { setRole(v); setPage(1); }} />
            <Select label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
            <Select label="Marketing" value={marketing} options={MARKETING_OPTIONS} onChange={(v) => { setMarketing(v); setPage(1); }} />
            <button
              type="submit"
              className="px-5 py-2 text-[11px] uppercase tracking-[0.2em] bg-black text-white hover:bg-zinc-800"
            >
              Search
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2 text-[11px] uppercase tracking-[0.2em] border border-zinc-200 hover:border-black"
            >
              Reset
            </button>
          </form>

          {error && (
            <p className="text-red-500 text-xs mb-6 bg-red-50 border border-red-100 py-3 px-4">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200">
                  <Th>Joined</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Phone</Th>
                  <Th className="hidden md:table-cell">Orders</Th>
                  <Th className="hidden md:table-cell">Last login</Th>
                  <Th>Status</Th>
                  <Th>Role</Th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-xs uppercase tracking-widest text-zinc-400">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && data.users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-xs uppercase tracking-widest text-zinc-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
                {!loading &&
                  data.users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedId(user.id)}
                      className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
                    >
                      <Td className="text-xs text-zinc-500">{formatDate(user.createdAt)}</Td>
                      <Td className="font-medium">{user.name}</Td>
                      <Td className="text-zinc-600">{user.email || '-'}</Td>
                      <Td className="text-zinc-600">{user.phoneNumber || '-'}</Td>
                      <Td className="hidden md:table-cell text-zinc-600">{user._count?.orders ?? 0}</Td>
                      <Td className="hidden md:table-cell text-zinc-500 text-xs">
                        {formatDate(user.lastLoginAt)}
                      </Td>
                      <Td>
                        <StatusBadge status={user.status} />
                      </Td>
                      <Td className="uppercase text-[11px] tracking-wider">{user.role}</Td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-8 text-xs">
              <p className="text-zinc-400 uppercase tracking-widest">
                Page {data.pagination.page} / {data.pagination.totalPages}
                <span className="mx-2 text-zinc-200">·</span>
                Total {data.pagination.total}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-zinc-200 hover:border-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-zinc-200 hover:border-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <UserDetailDrawer
        userId={selectedId}
        onClose={() => setSelectedId(null)}
        onUpdated={onUserUpdated}
        currentAdminId={session?.user?.id}
      />
    </PageContainer>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.2em] text-zinc-400 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-b border-zinc-200 py-2 text-sm bg-transparent focus:outline-none focus:border-black"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`py-4 px-3 text-[10px] uppercase tracking-widest text-zinc-500 font-normal ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return <td className={`py-4 px-3 ${className}`}>{children}</td>;
}
